all:
	cd src/js/ && npm install

install:
	mkdir -p ${DESTDIR}/usr/bin
	mkdir -p ${DESTDIR}/usr/share
	mkdir -p ${DESTDIR}/etc/tg-torrent-bot
	cp src/tg-torrent-bot ${DESTDIR}/usr/bin
	cp -r src/js ${DESTDIR}/usr/share/tg-torrent-bot
	cp -r src/main.cfg ${DESTDIR}/etc/tg-torrent-bot