#!/bin/bash

# Compile schemas
glib-compile-schemas "src/schemas/"

# Delete existing copy of the extension
rm -rf ~/.local/share/gnome-shell/extensions/gnome-phpmyadmin@hasanfirdaus.com
mkdir -p ~/.local/share/gnome-shell/extensions/gnome-phpmyadmin@hasanfirdaus.com

#Copy extension source to the directory
cp -a "src/." ~/.local/share/gnome-shell/extensions/gnome-phpmyadmin@hasanfirdaus.com

echo "Please restart gnome shell"
