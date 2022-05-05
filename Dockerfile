FROM ubuntu:22.04

SHELL ["/bin/bash", "-c"]

RUN apt-get update \
    && apt-get install -y software-properties-common apt-utils \
    && add-apt-repository ppa:fertkir/tg-torrent-bot \
    && apt-get update \
    && apt-get install -y tg-torrent-bot

CMD ["node", "/usr/share/tg-torrent-bot/index.js"]
