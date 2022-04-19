current_version := $$(head -1 debian/changelog | cut -d '(' -f2 | cut -d ')' -f1)
build := build/tg-torrent-bot

all:

install:
# 	mkdir -p ${DESTDIR}/usr/bin
# 	mkdir -p ${DESTDIR}/usr/share
# 	mkdir -p ${DESTDIR}/etc/tg-torrent-bot
# 	cp src/tg-torrent-bot ${DESTDIR}/usr/bin
# 	cp -r src/js ${DESTDIR}/usr/share/tg-torrent-bot
# 	cp src/main.cfg ${DESTDIR}/etc/tg-torrent-bot

clean:
	rm -rf src/js/node_modules
	rm -rf build

npm_install:
	cd src/js; npm install; cd ../..

build: npm_install
	mkdir -p ${build}/usr/bin
	mkdir -p ${build}/usr/share
	mkdir -p ${build}/etc/tg-torrent-bot
	cp -r debian ${build}/
	cp src/tg-torrent-bot ${build}/usr/bin
	cp src/main.cfg ${build}/etc/tg-torrent-bot
	cp -r src/js ${build}/usr/share/tg-torrent-bot

build-deb:
	cd ${build}; debuild -b; cd ../..

new_version:
	gbp dch --debian-branch=main --git-author --distribution=focal --dch-opt=--upstream
	git add debian/
	git commit -m "version ${current_version}"
	git push

publish: clean new_version build
	cd ${build}; debuild -S; cd ../..
	cd build; dput ppa:fertkir/tg-torrent-bot ../tg-torrent-bot_${current_version}_source.changes; cd ..