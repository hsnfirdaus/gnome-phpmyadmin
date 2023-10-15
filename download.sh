#!/bin/bash

curl -o pma.zip https://files.phpmyadmin.net/phpMyAdmin/5.2.1/phpMyAdmin-5.2.1-all-languages.zip
unzip pma.zip -d .
mv phpMyAdmin-5.2.1-all-languages src/phpmyadmin
rm pma.zip
randomBlowfishSecret=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c32)
sed -e "s|cfg\['blowfish_secret'\] = ''|cfg['blowfish_secret'] = '$randomBlowfishSecret'|" src/phpmyadmin/config.sample.inc.php > src/phpmyadmin/config.inc.php