# Telegram Torrent Bot

A telegram bot implementation for torrents search and download.

You can run the bot on your home network server, and watch downloaded movies using Kodi or share them via DLNA.

### Requirements before build

See this tutorial: https://saveriomiroddi.github.io/Building-a-debian-deb-source-package-and-publishing-it-on-an-ubuntu-ppa/
```
sudo apt install gnupg dput dh-make devscripts lintian
```

### Build & Publish to PPA
```
cd src/js
npm install
cd ../..
debuild -S | tee /tmp/debuild.log 2>&1
cd ..
dput ppa:fertkir/tg-torrent-bot tg-torrent-bot_{current-version}_source.changes
```
