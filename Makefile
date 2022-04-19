repo_root := $$(git rev-parse --show-toplevel)
current_version := $$(head -1 ${repo_root}/debian/changelog | cut -d '(' -f2 | cut -d ')' -f1)
build := ${repo_root}/build
build_copy := ${build}/tg-torrent-bot

clean:
	git clean -dfX

npm_install:
	cd ${repo_root}/src/js; npm install; cd ${repo_root}

build: npm_install
	cd ${repo_root}/src; debuild -b; cd ${repo_root}

new_version:
	gbp dch --debian-branch=main --git-author --distribution=focal --dch-opt=--upstream
	git add debian/
	git commit -m "version ${current_version}"
	git push

publish: clean new_version build
	cd ${build_copy}; debuild -S; cd ${repo_root}
	cd ${build}; dput ppa:fertkir/tg-torrent-bot ${build}/tg-torrent-bot_${current_version}_source.changes; cd ${repo_root}