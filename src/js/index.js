const fs = require('fs');
const os = require('os');
const moment = require('moment');
const pretty = require('prettysize');
const RutrackerApi = require('rutracker-api-with-proxy');
const TelegramBot = require('node-telegram-bot-api');
const { NotAuthorizedError } = require("rutracker-api-with-proxy/lib/errors");
const { I18n } = require('i18n');
const path = require('path');

function getRutrackerProxySettings() {
    if (process.env.PROXY_RUTRACKER === 'true' && process.env.PROXY_HOST && process.env.PROXY_PORT) {
        if (process.env.PROXY_USERNAME && process.env.PROXY_PASSWORD) {
            return {
                host: process.env.PROXY_HOST,
                port: process.env.PROXY_PORT,
                auth: {
                    username: process.env.PROXY_USERNAME,
                    password: process.env.PROXY_PASSWORD
                }
            }
        }
        return {
            host: process.env.PROXY_HOST,
            port: process.env.PROXY_PORT
        }
    }
}

function getTelegramProxySettings() {
    if (process.env.PROXY_TELEGRAM === 'true' && process.env.PROXY_HOST && process.env.PROXY_PORT) {
        if (process.env.PROXY_USERNAME && process.env.PROXY_PASSWORD) {
            return 'http://' + process.env.PROXY_USERNAME + ':' + 
                    encodeURIComponent(process.env.PROXY_PASSWORD) + '@' + 
                    process.env.PROXY_HOST + ':' + process.env.PROXY_PORT + '/'
        }
        return 'http://' + process.env.PROXY_HOST + ':' + process.env.PROXY_PORT + '/'
    }
}

const RUTRACKER_CREDENTIALS = {
    username: process.env.RUTRACKER_USERNAME,
    password: process.env.RUTRACKER_PASSWORD
};
const CURRENT_DOWNLOADS = process.env.CURRENT_DOWNLOADS;
const TORRENTS_DIR = process.env.TORRENTS_DIR;
const ALLOWED_USERS = (process.env.ALLOWED_USERS || '').split(',').filter(Number).map(Number);

const rutracker = new RutrackerApi(
	process.env.RUTRACKER_HOST, 
	getRutrackerProxySettings()
);
const bot = new TelegramBot(
	process.env.TELEGRAM_TOKEN, 
	{
    	polling: true,
    	request: {
	    	proxy: getTelegramProxySettings()
        }
    }
);

const i18n = {
    i18nObj: new I18n({
        locales: ['en', 'ru'],
        directory: path.join(__dirname, 'locales')
    }),
    __: function (tgMsg, i18nString) {
        const langCode = tgMsg.from.language_code;
        return this.i18nObj.__({ 
            phrase: i18nString, 
            locale: this.i18nObj.getLocales().includes(langCode) ? langCode : 'en'
        });
    }
}

// main logic
bot.onText(/^[^\/]/, (msg) => {
    if (isForbiddenUser(msg.from.id)) {
        return;
    }
    var text = msg.text;
    if (text.includes('#kinopoisk')) {
        text = text.match(/Фильм (.+)#/)[1].replace(/["(),]/g, '');
    }
    wrapQuery(() => rutracker.search({query: text, sort: 'seeds', order: 'desc'}))
        .then(torrents => {
            const response = torrents.length == 0
            ? `Результатов по запросу \"${text}\" не найдено.`
            : torrents.slice(0, 10)
                .map(torrent => {
                    return `${torrent.title}\n`
                        + `${torrent.id}\n`
                        + `[Описание](${process.env.RUTRACKER_HOST}/forum/viewtopic.php?t=${torrent.id})\n`
                        + `S ${torrent.seeds} | L ${torrent.leeches} | Скачали ${torrent.downloads} | `
                        + `Reg ${moment(torrent.registered).format("YYYY-MM-DD")} | ` 
                        + `Размер ${pretty(torrent.size)}\n`
                        + `*Поставить на закачку*: /d\\_${torrent.id}\n`
                        + `Получить ссылку: /m\\_${torrent.id}\n`;
                    })
                .join("\n");
            bot.sendMessage(msg.chat.id, response, {parse_mode: 'markdown', disable_web_page_preview: true});
        });
});

function isForbiddenUser(userId) {
    return ALLOWED_USERS.length > 0 && !ALLOWED_USERS.includes(userId);
}

function wrapQuery(query) {
    return query()
        .catch(e => {
            if (e instanceof NotAuthorizedError) {
                return rutracker.login(RUTRACKER_CREDENTIALS)
                    .then(() => query());
            }
        });
}

// downloading .torrent file
bot.onText(/\/d_(.+)/, (msg, match) => {
    if (isForbiddenUser(msg.from.id)) {
        return;
    }
    const param = match[1];

    wrapQuery(() => rutracker.getMagnetLink(param))
        .then(link => {
            fs.writeFile(
                `${CURRENT_DOWNLOADS}/${link.match(/urn:btih:([a-z0-9]+)&/i)[1].toLowerCase()}`, 
                `${msg.chat.id}`, 
                function (err,data) {
                    if (err) {
                        return console.log(err);
                    }
                });
        });

    wrapQuery(() => rutracker.download(param))
        .then(stream => {
            bot.sendMessage(msg.chat.id, i18n.__(msg, 'Sent for downloading'));
            return stream.pipe(fs.createWriteStream(`${TORRENTS_DIR}/${param}.torrent`))
        });
});

// getting magnet link
bot.onText(/\/m_(.+)/, (msg, match) => {
    if (isForbiddenUser(msg.from.id)) {
        return;
    }
    const param = match[1];

    wrapQuery(() => rutracker.getMagnetLink(param))
        .then(link => bot.sendMessage(msg.chat.id, '```\n' + link + '\n```', {parse_mode: 'markdown', disable_web_page_preview: true}));
});

// help
bot.onText(/^\/start|^\/help/, (msg) => {
    if (isForbiddenUser(msg.from.id)) {
        return;
    }
    bot.sendMessage(msg.chat.id, i18n.__(msg, 'Help Message'));
});
