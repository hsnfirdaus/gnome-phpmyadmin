import Gio from "gi://Gio";
import GLib from "gi://GLib";
import GObject from "gi://GObject";
import * as QuickSettings from "resource:///org/gnome/shell/ui/quickSettings.js";

const PMAToggle = GObject.registerClass(
  class PMAToggle extends QuickSettings.QuickToggle {
    _init(extensionObject) {
      super._init({
        title: "phpMyAdmin",
        gicon: Gio.icon_new_for_string(
          extensionObject.path + "/icons/phpmyadmin.svg"
        ),
      });
    }
  }
);

export var PMAIndicator = GObject.registerClass(
  /**
   * PMA Indicator
   *
   * Handle many of extension functionallity
   */
  class PMAIndicator extends QuickSettings.SystemIndicator {
    /**
     * @type {Gio.Subprocess|null}
     */
    _proc = null;

    _init(extensionObject) {
      super._init();
      this._indicator = this._addIndicator();
      this._settings = extensionObject.getSettings();
      this._pmaFolder = extensionObject.metadata.path + "/phpmyadmin";
      this._extFolder = extensionObject.metadata.path;
      this._indicator.visible = false;
      this._indicator.gicon = Gio.icon_new_for_string(
        extensionObject.path + "/icons/phpmyadmin.svg"
      );

      //Create a Toggle for QuickSettings
      this._toggle = new PMAToggle(extensionObject);
      this._toggle.connect("clicked", () => {
        this.handleToggle();
      });
    }

    destroy() {
      if (this._proc !== null) {
        this.stopProccess();
      }
      this._settings = null;
      this._indicator.destroy();
      super.destroy();
    }

    /**
     * Change status of toggle
     * @param {boolean} isActive Status of toggle
     * @param {string} optionalStatus Optional subtitle of toggle
     */
    updateStatus(isActive, optionalStatus) {
      this._indicator.visible = isActive;
      this._toggle.set({ checked: isActive, subtitle: optionalStatus });
    }

    openBrowser() {
      try {
        const url = "http://localhost:" + this._pmaPort;
        const appInfo = Gio.AppInfo.get_default_for_type(
          "x-scheme-handler/http",
          null
        );

        if (appInfo) {
          appInfo.launch_uris([url], null);
        } else {
          logError("No default web browser found.");
        }
      } catch (error) {
        logError(`Error opening URL: ${error.message}`);
      }
    }

    stopProccess() {
      this._proc.force_exit();
      const cancellable = new Gio.Cancellable();
      this._proc.wait(cancellable);
      this.updateStatus(false, "Stopped");
      this._proc = null;
    }

    /**
     * Reads a line from `stdout`, then queues another read/write
     *
     * @param {Gio.OutputStream} stdout - the `stdout` stream
     */
    readOutput(stdout) {
      stdout.read_line_async(GLib.PRIORITY_LOW, null, (stream, result) => {
        try {
          const [line] = stream.read_line_finish_utf8(result);

          if (line !== null) {
            if (
              line.includes("Development Server") &&
              line.includes("started")
            ) {
              this.updateStatus(true, "http://localhost:" + this._pmaPort);
              this.openBrowser();
            } else if (line.includes("Failed to listen")) {
              let matches = line.match("/(reason:(.*?))/");
              let reason = matches?.[1] ?? "Failed to start server";
              this.updateStatus(false, reason);
              this.showError(reason);
            }
          }
        } catch (e) {
          logError(e);
        }
      });
    }

    handleToggle() {
      if (this._proc !== null) {
        try {
          this.stopProccess();
          return;
        } catch (error) {
          logError(error);
        }
      }

      try {
        const binary = this._settings.get_string("php-binary");
        this._pmaPort = this._settings.get_uint("pma-port") ?? 8430;
        this._proc = Gio.Subprocess.new(
          [
            binary ?? "php",
            "-S",
            "localhost:" + this._pmaPort,
            "-t",
            this._pmaFolder,
          ],
          Gio.SubprocessFlags.STDERR_PIPE
        );

        const stdoutStream = new Gio.DataInputStream({
          base_stream: this._proc.get_stderr_pipe(),
          close_base_stream: true,
        });

        // Start the loop
        this.readOutput(stdoutStream);

        this._proc.wait_async(null, () => {
          this._proc = null;
        });
      } catch (e) {
        logError(e);
        this.showError(e.message);
        this._proc = null;
      }
    }

    /**
     *
     * @param {string} message Error message
     */
    showError(message) {
      try {
        Gio.Subprocess.new(
          [
            "gjs",
            this._extFolder + "/error.js",
            '"' + message.replace('"', '\\"') + '"',
          ],

          Gio.SubprocessFlags.NONE
        );
      } catch (e) {
        logError(e);
      }
    }
  }
);
