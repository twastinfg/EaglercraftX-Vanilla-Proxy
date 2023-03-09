import { Constants } from "./Constants.js";
import { Enums } from "./Enums.js";
import { MineProtocol } from "./Protocol.js";
import { Util } from "./Util.js";
import sharp from "sharp";
import { SCChannelMessagePacket } from "./packets/channel/SCChannelMessage.js";
import { Logger } from "../logger.js";
// TODO: convert all functions to use MineProtocol's UUID manipulation functions
export var EaglerSkins;
(function (EaglerSkins) {
    function downloadSkin(skinUrl) {
        const url = new URL(skinUrl);
        if (url.protocol != "https:" && url.protocol != "http:")
            throw new Error("Invalid skin URL protocol!");
        return new Promise(async (res, rej) => {
            const skin = await fetch(skinUrl);
            if (skin.status != 200) {
                rej(`Tried to fetch ${skinUrl}, got HTTP ${skin.status} instead!`);
                return;
            }
            else {
                res(Buffer.from(await skin.arrayBuffer()));
            }
        });
    }
    EaglerSkins.downloadSkin = downloadSkin;
    function readClientDownloadSkinRequestPacket(message) {
        const ret = {
            id: null,
            uuid: null,
            url: null
        };
        const id = MineProtocol.readVarInt(message), uuid = MineProtocol.readUUID(id.newBuffer), url = MineProtocol.readString(uuid.newBuffer, 1);
        ret.id = id.value;
        ret.uuid = uuid.value;
        ret.url = url.value;
        return ret;
    }
    EaglerSkins.readClientDownloadSkinRequestPacket = readClientDownloadSkinRequestPacket;
    function writeClientDownloadSkinRequestPacket(uuid, url) {
        return Buffer.concat([
            [Enums.EaglerSkinPacketId.CFetchSkinReq],
            MineProtocol.writeUUID(uuid),
            [0x0],
            MineProtocol.writeString(url)
        ].map(arr => arr instanceof Uint8Array ? arr : Buffer.from(arr)));
    }
    EaglerSkins.writeClientDownloadSkinRequestPacket = writeClientDownloadSkinRequestPacket;
    function readServerFetchSkinResultBuiltInPacket(message) {
        const ret = {
            id: null,
            uuid: null,
            skinId: null
        };
        const id = MineProtocol.readVarInt(message), uuid = MineProtocol.readUUID(id.newBuffer), skinId = MineProtocol.readVarInt(id.newBuffer.subarray(id.newBuffer.length));
        ret.id = id.value;
        ret.uuid = uuid.value;
        ret.skinId = skinId.value;
        return this;
    }
    EaglerSkins.readServerFetchSkinResultBuiltInPacket = readServerFetchSkinResultBuiltInPacket;
    function writeServerFetchSkinResultBuiltInPacket(uuid, skinId) {
        uuid = typeof uuid == 'string' ? Util.uuidStringToBuffer(uuid) : uuid;
        console.log(1);
        return Buffer.concat([
            Buffer.from([Enums.EaglerSkinPacketId.SFetchSkinBuiltInRes]),
            uuid,
            Buffer.from([
                skinId >> 24,
                skinId >> 16,
                skinId >> 8,
                skinId & 0xFF
            ])
        ]);
    }
    EaglerSkins.writeServerFetchSkinResultBuiltInPacket = writeServerFetchSkinResultBuiltInPacket;
    function readServerFetchSkinResultCustomPacket(message) {
        const ret = {
            id: null,
            uuid: null,
            skin: null
        };
        const id = MineProtocol.readVarInt(message), uuid = MineProtocol.readUUID(id.newBuffer), skin = uuid.newBuffer.subarray(0, Constants.EAGLERCRAFT_SKIN_CUSTOM_LENGTH);
        ret.id = id.value;
        ret.uuid = uuid.value;
        ret.skin = skin;
        return this;
    }
    EaglerSkins.readServerFetchSkinResultCustomPacket = readServerFetchSkinResultCustomPacket;
    // TODO: fix bug where some people are missing left arm and leg
    function writeServerFetchSkinResultCustomPacket(uuid, skin, downloaded) {
        uuid = typeof uuid == 'string' ? Util.uuidStringToBuffer(uuid) : uuid;
        return Buffer.concat([
            [Enums.EaglerSkinPacketId.SFetchSkinRes],
            uuid,
            !downloaded ? [0x01] : [0x01],
            skin.subarray(0, Constants.EAGLERCRAFT_SKIN_CUSTOM_LENGTH)
        ].map(arr => arr instanceof Uint8Array ? arr : Buffer.from(arr)));
    }
    EaglerSkins.writeServerFetchSkinResultCustomPacket = writeServerFetchSkinResultCustomPacket;
    function readClientFetchEaglerSkinPacket(buff) {
        const ret = {
            id: null,
            uuid: null
        };
        const id = MineProtocol.readVarInt(buff), uuid = MineProtocol.readUUID(id.newBuffer);
        ret.id = id.value;
        ret.uuid = uuid.value;
        return ret;
    }
    EaglerSkins.readClientFetchEaglerSkinPacket = readClientFetchEaglerSkinPacket;
    function writeClientFetchEaglerSkin(uuid, url) {
        uuid = typeof uuid == 'string' ? Util.uuidStringToBuffer(uuid) : uuid;
        return Buffer.concat([
            [Enums.EaglerSkinPacketId.CFetchSkinEaglerPlayerReq],
            uuid,
            [0x00],
            MineProtocol.writeString(url)
        ].map(arr => arr instanceof Uint8Array ? arr : Buffer.from(arr)));
    }
    EaglerSkins.writeClientFetchEaglerSkin = writeClientFetchEaglerSkin;
    async function toEaglerSkin(image) {
        const r = await sharp(image).extractChannel('red').raw({ depth: 'uchar' }).toBuffer();
        const g = await sharp(image).extractChannel('green').raw({ depth: 'uchar' }).toBuffer();
        const b = await sharp(image).extractChannel('blue').raw({ depth: 'uchar' }).toBuffer();
        const a = await sharp(image).ensureAlpha().extractChannel(3).toColorspace('b-w').raw({ depth: 'uchar' }).toBuffer();
        const newBuff = Buffer.alloc(Constants.EAGLERCRAFT_SKIN_CUSTOM_LENGTH);
        for (let i = 1; i < 64 ** 2; i++) {
            const bytePos = i * 4;
            newBuff[bytePos] = a[i];
            newBuff[bytePos + 1] = b[i];
            newBuff[bytePos + 2] = g[i];
            newBuff[bytePos + 3] = r[i];
        }
        return newBuff;
    }
    EaglerSkins.toEaglerSkin = toEaglerSkin;
    class SkinServer {
        constructor(proxy, allowedSkinDomains) {
            this.allowedSkinDomains = allowedSkinDomains !== null && allowedSkinDomains !== void 0 ? allowedSkinDomains : ['textures.minecraft.net'];
            this.proxy = proxy !== null && proxy !== void 0 ? proxy : PROXY;
            this._logger = new Logger("SkinServer");
            this._logger.info("Started EaglercraftX skin server.");
        }
        async handleRequest(packet, caller) {
            var _a;
            if (packet.messageType == Enums.ChannelMessageType.SERVER)
                throw new Error("Server message was passed to client message handler!");
            else if (packet.channel != Constants.EAGLERCRAFT_SKIN_CHANNEL_NAME)
                throw new Error("Cannot handle non-EaglerX skin channel messages!");
            switch (packet.data[0]) {
                default:
                    throw new Error("Unknown operation!");
                    break;
                case Enums.EaglerSkinPacketId.CFetchSkinEaglerPlayerReq:
                    const parsedPacket_0 = EaglerSkins.readClientFetchEaglerSkinPacket(packet.data);
                    const player = this.proxy.fetchUserByUUID(parsedPacket_0.uuid);
                    if (player) {
                        if (player.skin.type == Enums.SkinType.BUILTIN) {
                            const response = new SCChannelMessagePacket();
                            response.channel = Constants.EAGLERCRAFT_SKIN_CHANNEL_NAME;
                            response.data = EaglerSkins.writeServerFetchSkinResultBuiltInPacket(player.uuid, player.skin.builtInSkin);
                            caller.write(response);
                        }
                        else if (player.skin.type == Enums.SkinType.CUSTOM) {
                            const response = new SCChannelMessagePacket();
                            response.channel = Constants.EAGLERCRAFT_SKIN_CHANNEL_NAME;
                            response.data = EaglerSkins.writeServerFetchSkinResultCustomPacket(player.uuid, player.skin.skin, false);
                            caller.write(response);
                        }
                        else
                            this._logger.warn(`Player ${caller.username} attempted to fetch player ${player.uuid}'s skin, but their skin hasn't loaded yet!`);
                    }
                    break;
                case Enums.EaglerSkinPacketId.CFetchSkinReq:
                    const parsedPacket_1 = EaglerSkins.readClientDownloadSkinRequestPacket(packet.data), url = new URL(parsedPacket_1.url).hostname;
                    if (!this.allowedSkinDomains.some(domain => Util.areDomainsEqual(domain, url))) {
                        this._logger.warn(`Player ${caller.username} tried to download a skin with a disallowed domain name(${url})!`);
                        break;
                    }
                    try {
                        const fetched = await EaglerSkins.downloadSkin(parsedPacket_1.url), processed = await EaglerSkins.toEaglerSkin(fetched), response = new SCChannelMessagePacket();
                        response.channel = Constants.EAGLERCRAFT_SKIN_CHANNEL_NAME;
                        response.data = EaglerSkins.writeServerFetchSkinResultCustomPacket(parsedPacket_1.uuid, processed, true);
                        caller.write(response);
                    }
                    catch (err) {
                        this._logger.warn(`Failed to fetch skin URL ${parsedPacket_1.url} for player ${caller.username}: ${(_a = err.stack) !== null && _a !== void 0 ? _a : err}`);
                    }
            }
        }
    }
    EaglerSkins.SkinServer = SkinServer;
    class EaglerSkin {
    }
    EaglerSkins.EaglerSkin = EaglerSkin;
})(EaglerSkins || (EaglerSkins = {}));
