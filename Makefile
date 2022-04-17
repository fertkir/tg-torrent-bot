current_version := $$(head -1 debian/changelog | cut -d '(' -f2 | cut -d ')' -f1)

all:

install:
	mkdir -p ${DESTDIR}/usr/bin
	mkdir -p ${DESTDIR}/usr/share
	mkdir -p ${DESTDIR}/etc/tg-torrent-bot
	cp src/tg-torrent-bot ${DESTDIR}/usr/bin
	cp -r src/js ${DESTDIR}/usr/share/tg-torrent-bot
	cp src/main.cfg ${DESTDIR}/etc/tg-torrent-bot

npm_install:
	cd src/js
	npm install
	cd ../..

debuild:
	debuild -S | tee /tmp/debuild.log 2>&1

dput:
	dput ppa:fertkir/tg-torrent-bot ../tg-torrent-bot_${current_version}_source.changes

new_version:
	gbp dch --debian-branch=main --git-author --distribution=focal --dch-opt=--upstream
	git add debian/
	git commit -m "version ${current_version}"
	git push

publish: npm_install new_version debuild dput