import { randomUUID } from 'crypto';
import pkg from 'minecraft-protocol';
import sharp from 'sharp';
import { PROXY_BRANDING, PROXY_VERSION } from '../meta.js';
import { Chat } from './Chat.js';
const { ping } = pkg;
export var Motd;
(function (Motd) {
    const ICON_SQRT = 64;
    const IMAGE_DATA_PREPEND = "data:image/png;base64,";
    class MOTD {
        constructor(motd, image) {
            this.jsonMotd = motd;
            this.image = image;
        }
        static async generateMOTDFromPing(host, port) {
            const pingRes = await ping({ host: host, port: port });
            if (typeof pingRes.version == 'string')
                throw new Error("Non-1.8 server detected!");
            else {
                const newPingRes = pingRes;
                let image;
                if (newPingRes.favicon != null) {
                    if (!newPingRes.favicon.startsWith(IMAGE_DATA_PREPEND))
                        throw new Error("Invalid MOTD image!");
                    image = await this.generateEaglerMOTDImage(Buffer.from(newPingRes.favicon.substring(IMAGE_DATA_PREPEND.length), 'base64'));
                }
                return new MOTD({
                    brand: PROXY_BRANDING,
                    cracked: true,
                    data: {
                        cache: true,
                        icon: newPingRes.favicon != null ? true : false,
                        max: newPingRes.players.max,
                        motd: [typeof newPingRes.description == 'string' ? newPingRes.description : Chat.chatToPlainString(newPingRes.description), ""],
                        online: newPingRes.players.online,
                        players: newPingRes.players.sample != null ? newPingRes.players.sample.map(v => v.name) : [],
                    },
                    name: "placeholder name",
                    secure: false,
                    time: Date.now(),
                    type: "motd",
                    uuid: randomUUID(),
                    vers: `${PROXY_BRANDING}/${PROXY_VERSION}`
                }, image);
            }
        }
        static async generateMOTDFromConfig(config) {
            var _a;
            if (typeof config.motd != 'string') {
                const motd = new MOTD({
                    brand: PROXY_BRANDING,
                    cracked: true,
                    data: {
                        cache: true,
                        icon: config.motd.iconURL != null ? true : false,
                        max: config.maxConcurrentClients,
                        motd: [config.motd.l1, (_a = config.motd.l2) !== null && _a !== void 0 ? _a : ""],
                        online: 0,
                        players: []
                    },
                    name: config.name,
                    secure: false,
                    time: Date.now(),
                    type: 'motd',
                    uuid: randomUUID(),
                    vers: `${PROXY_BRANDING}/${PROXY_VERSION}`
                });
                if (config.motd.iconURL != null) {
                    motd.image = await this.generateEaglerMOTDImage(config.motd.iconURL);
                }
                return motd;
            }
            else
                throw new Error("MOTD is set to be forwarded in the config!");
        }
        // TODO: fix not working
        static generateEaglerMOTDImage(file) {
            return new Promise((res, rej) => {
                sharp(file)
                    .resize(ICON_SQRT, ICON_SQRT, {
                    kernel: 'nearest'
                })
                    .raw({
                    depth: 'uchar'
                })
                    .toBuffer()
                    .then(buff => {
                    for (const pixel of buff) {
                        if ((pixel & 0xFFFFFF) == 0) {
                            buff[buff.indexOf(pixel)] = 0;
                        }
                    }
                    res(buff);
                })
                    .catch(rej);
            });
        }
        toBuffer() {
            return [
                JSON.stringify(this.jsonMotd),
                this.image
            ];
        }
    }
    Motd.MOTD = MOTD;
})(Motd || (Motd = {}));
