const Adw = imports.gi.Adw;

/**
 *
 * @param {string} message Error message
 */
const errorWindow = (message) => {
  let application = new Adw.Application({
    application_id: "com.hasanfirdaus.gnome-phpmyadmin.error",
  });

  application.connect("activate", () => {
    const window = new Adw.Window({
      application,
      resizable: false,
      default_width: 500,
      default_height: 500,
      icon_name: "dialog-error",
    });

    const statusPage = new Adw.StatusPage({
      title: "Error!",
      description: message,
      icon_name: "dialog-error",
    });
    const toolBar = new Adw.ToolbarView({
      content: statusPage,
    });
    toolBar.add_top_bar(
      new Adw.HeaderBar({
        show_title: false,
      })
    );
    window.set_content(toolBar);
    window.present();
  });

  application.run([]);
};
errorWindow(ARGV[0]);
