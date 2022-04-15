#!/bin/bash

version=$(cat tg-torrent-bot/DEBIAN/control | sed -n -e 's/^Version: //p')
rm -rf .staging
mkdir .staging
cp -R tg-torrent-bot .staging/tg-torrent-bot_$version
dpkg-deb --build .staging/tg-torrent-bot_$version
mv .staging/tg-torrent-bot_$version .