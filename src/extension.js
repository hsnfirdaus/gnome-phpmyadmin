import { PMAIndicator } from "./indicator.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

export default class GNOMEPhpMyAdmin extends Extension {
  enable() {
    this._indicator = new PMAIndicator(this);

    this._indicator.quickSettingsItems.push(this._indicator._toggle);
    Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);
  }

  disable() {
    this._indicator.quickSettingsItems.forEach((item) => item.destroy());
    this._indicator.destroy();
    this._indicator = null;
  }
}
