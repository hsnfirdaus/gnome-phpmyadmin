import Adw from "gi://Adw";
import Gtk from "gi://Gtk";
import Gio from "gi://Gio";
import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class PMAToggleExtensionPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    window._settings = this.getSettings();
    const page = new Adw.PreferencesPage();
    window.add(page);

    const group = new Adw.PreferencesGroup({
      title: "Settings",
      description: "Extension settings",
    });
    page.add(group);

    const phpBinaryRow = new Adw.EntryRow({
      title: "PHP Binary location",
      text: window._settings.get_string("php-binary"),
    });
    window._settings.bind(
      "php-binary",
      phpBinaryRow,
      "text",
      Gio.SettingsBindFlags.DEFAULT
    );
    group.add(phpBinaryRow);

    const pmaPortRow = new Adw.SpinRow({
      title: "Port Number for phpMyAdmin",
      subtitle: "Port between 1024-65535",
      adjustment: new Gtk.Adjustment({
        value: window._settings.get_uint("pma-port"),
        lower: 1024,
        upper: 65535,
        step_increment: 1,
      }),
    });

    window._settings.bind(
      "pma-port",
      pmaPortRow,
      "value",
      Gio.SettingsBindFlags.DEFAULT
    );

    group.add(pmaPortRow);

    const miscGroup = new Adw.PreferencesGroup();
    page.add(miscGroup);

    const aboutWindow = new Adw.AboutWindow({
      transient_for: window,
      application_name: "GNOME phpMyAdmin",
      copyright: "© 2023 Muhammad Hasan Firdaus",
      developer_name: "Muhammad Hasan Firdaus",
      developers: ["Muhammad Hasan Firdaus"],
      comments: "Run phpMyAdmin from GNOME Shell.",
      version: this.metadata.version + ".0.0",
      license_type: Gtk.License.GPL_2_0,
      hide_on_close: true,
    });

    const aboutRow = new Adw.ActionRow({
      title: "About",
      activatable_widget: aboutWindow,
    });

    aboutRow.connect("activated", () => {
      aboutWindow.present();
    });

    aboutRow.add_suffix(new Gtk.Image({ iconName: "go-next" }));

    miscGroup.add(aboutRow);
  }
}
