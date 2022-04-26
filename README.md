# Telegram Torrent Bot

A telegram bot implementation for torrents search and download.
You can run the bot on your home network server, and watch downloaded movies using Kodi or share them via DLNA.

DISCLAIMER: Please be aware that some of the materials you can get access to by means of this software might be subjects to copyright laws. Please use this software only for lawful purposes. The author of the software isn't responsible for any violations.

### Installation

#### [Ubuntu PPA](https://launchpad.net/~fertkir/+archive/ubuntu/tg-torrent-bot)
```
sudo add-apt-repository ppa:fertkir/tg-torrent-bot
sudo apt update
sudo apt install tg-torrent-bot
```
You will be asked for:
* a bot token (take it from [@BotFather](https://t.me/BotFather)) 
* rutracker login/password
* path to folder where bot will put .torrent files, e.g. `/home/<youruser>/Torrents`

Once you complete the setup, the bot will run as a systemd-service.
Now give the bot permission to write .torrent files to the folder you provided:
```
mkdir -p /home/<youruser>/Torrents
sudo chown <youruser>:tg-torrent-bot /home/<youruser>/Torrents
```

### Integration with Transmission
Install transmission-daemon, if not installed:
```
sudo apt install transmission-daemon
```
Stop the transmission-daemon and edit its settings:
```
sudo systemctl stop transmission-daemon.service
sudo vim /etc/transmission-daemon/settings.json
```
Make sure `settings.json` contains these settings:
```
    "script-torrent-done-enabled": true,
    "script-torrent-done-filename": "/usr/bin/tg-torrent-bot",
    "watch-dir": "/home/username/Torrents",
    "watch-dir-enabled": true

```
where `/home/username/Torrents` is a .torrent files directory which you've set during installation.

Start the transmission-daemon:
```
sudo systemctl start transmission-daemon.service
```

### Build
```
sudo apt install gnupg dput dh-make devscripts lintian git git-buildpackage
git clone https://github.com/fertkir/tg-torrent-bot
cd tg-torrent-bot
make build-deb
```
