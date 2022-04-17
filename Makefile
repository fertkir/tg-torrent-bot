all:

install:
	mkdir -p ${DESTDIR}/usr/bin
	mkdir -p ${DESTDIR}/usr/share
	mkdir -p ${DESTDIR}/etc/tg-torrent-bot
	cp src/tg-torrent-bot ${DESTDIR}/usr/bin
	cp -r src/js ${DESTDIR}/usr/share/tg-torrent-bot
	cp src/main.cfg ${DESTDIR}/etc/tg-torrent-bot
	useradd tg-torrent-bot
	cp src/tg-torrent-bot.service /etc/systemd/system/
	systemctl start tg-torrent-bot
	systemctl enable tg-torrent-bot