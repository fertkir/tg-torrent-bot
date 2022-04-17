# Telegram Torrent Bot

A telegram bot implementation for torrents search and download.

You can run the bot on your home network server, and watch downloaded movies using Kodi or share them via DLNA.

### Requirements before build

See this tutorial: https://saveriomiroddi.github.io/Building-a-debian-deb-source-package-and-publishing-it-on-an-ubuntu-ppa/
```
sudo apt install gnupg dput dh-make devscripts lintian git git-buildpackage
```

### Build & Publish to PPA
```
make publish
```
