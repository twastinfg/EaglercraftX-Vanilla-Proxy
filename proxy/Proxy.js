import { WebSocketServer } from "ws";
import { Logger } from "../logger.js";
import { loadPackets } from "./Packet.js";
import * as http from "http";
import * as https from "https";
import { readFile } from "fs/promises";
import { Util } from "./Util.js";
import CSLoginPacket from "./packets/CSLoginPacket.js";
import SCIdentifyPacket from "./packets/SCIdentifyPacket.js";
import { Motd } from "./Motd.js";
import { Player } from "./Player.js";
import { Enums } from "./Enums.js";
import { NETWORK_VERSION, PROXY_BRANDING, PROXY_VERSION, VANILLA_PROTOCOL_VERSION } from "../meta.js";
import { SCSyncUuidPacket } from "./packets/SCSyncUuidPacket.js";
import { SCReadyPacket } from "./packets/SCReadyPacket.js";
import { Chalk } from "chalk";
import EventEmitter from "events";
import { EaglerSkins } from "./EaglerSkins.js";
import { Constants } from "./Constants.js";
let instanceCount = 0;
const chalk = new Chalk({ level: 2 });
export class Proxy extends EventEmitter {
    constructor(config, pluginManager) {
        super();
        this.players = new Map();
        this.LOGIN_TIMEOUT = 30000;
        this._logger = new Logger(`EaglerProxy-${instanceCount}`);
        this.initalHandlerLogger = new Logger(`EaglerProxy-InitialHandler`);
        this.initalHandlerLogger._info = this.initalHandlerLogger.info;
        this.initalHandlerLogger.info = (msg) => {
            ;
            this.initalHandlerLogger._info(`${chalk.blue("[InitialHandler]")} ${msg}`);
        };
        this.initalHandlerLogger._warn = this.initalHandlerLogger.warn;
        this.initalHandlerLogger.warn = (msg) => {
            ;
            this.initalHandlerLogger._warn(`${chalk.blue("[InitialHandler]")} ${msg}`);
        };
        this.initalHandlerLogger._error = this.initalHandlerLogger.error;
        this.initalHandlerLogger.error = (msg) => {
            ;
            this.initalHandlerLogger._error(`${chalk.blue("[InitialHandler]")} ${msg}`);
        };
        this.initalHandlerLogger._fatal = this.initalHandlerLogger.fatal;
        this.initalHandlerLogger.fatal = (msg) => {
            ;
            this.initalHandlerLogger._fatal(`${chalk.blue("[InitialHandler]")} ${msg}`);
        };
        this.initalHandlerLogger._debug = this.initalHandlerLogger.debug;
        this.initalHandlerLogger.debug = (msg) => {
            ;
            this.initalHandlerLogger._debug(`${chalk.blue("[InitialHandler]")} ${msg}`);
        };
        this.config = config;
        this.pluginManager = pluginManager;
        instanceCount++;
        process.on('uncaughtException', err => {
            this._logger.warn(`An uncaught exception was caught! Error: ${err.stack}`);
        });
        process.on('unhandledRejection', err => {
            this._logger.warn(`An unhandled rejection was caught! Rejection: ${err}`);
        });
    }
    async init() {
        this._logger.info(`Starting ${PROXY_BRANDING} v${PROXY_VERSION}...`);
        global.PROXY = this;
        if (this.loaded)
            throw new Error("Can't initiate if proxy instance is already initialized or is being initialized!");
        this.loaded = true;
        this.packetRegistry = await loadPackets();
        this.skinServer = new EaglerSkins.SkinServer(this, this.config.skinUrlWhitelist);
        global.PACKET_REGISTRY = this.packetRegistry;
        if (this.config.motd == 'FORWARD') {
            this._pollServer(this.config.server.host, this.config.server.port);
        }
        else {
            // TODO: motd
            const broadcastMOTD = await Motd.MOTD.generateMOTDFromConfig(this.config);
            broadcastMOTD._static = true;
            this.broadcastMotd = broadcastMOTD;
            // playercount will be dynamically updated 
        }
        if (this.config.tls && this.config.tls.enabled) {
            this.httpServer = https.createServer({
                key: await readFile(this.config.tls.key),
                cert: await readFile(this.config.tls.cert)
            }, (req, res) => this._handleNonWSRequest(req, res, this.config)).listen(this.config.bindPort || 8080, this.config.bindHost || '127.0.0.1');
            this.wsServer = new WebSocketServer({
                noServer: true
            });
        }
        else {
            this.httpServer = http.createServer((req, res) => this._handleNonWSRequest(req, res, this.config)).listen(this.config.bindPort || 8080, this.config.bindHost || '127.0.0.1');
            this.wsServer = new WebSocketServer({
                noServer: true
            });
        }
        this.httpServer.on('error', err => {
            this._logger.warn(`HTTP server threw an error: ${err.stack}`);
        });
        this.wsServer.on('error', err => {
            this._logger.warn(`WebSocket server threw an error: ${err.stack}`);
        });
        this.httpServer.on('upgrade', async (r, s, h) => {
            var _a;
            try {
                await this._handleWSConnectionReq(r, s, h);
            }
            catch (err) {
                this._logger.error(`Error was caught whilst trying to handle WebSocket upgrade! Error: ${(_a = err.stack) !== null && _a !== void 0 ? _a : err}`);
            }
        });
        this.pluginManager.emit('proxyFinishLoading', this, this.pluginManager);
        this._logger.info(`Started WebSocket server and binded to ${this.config.bindHost} on port ${this.config.bindPort}.`);
    }
    _handleNonWSRequest(req, res, config) {
        var _a;
        res.writeHead(426)
            .end(`Hey there! This server is a EaglercraftX game server. To connect to this EaglercraftX server, `
            + `add this server to your game's serverlist or direct connect to wss://${(_a = req.headers.host) !== null && _a !== void 0 ? _a : req.headers[":authority"]}. `
            + "Thank you!");
    }
    async _handleWSConnection(ws) {
        var _a;
        const firstPacket = await Util.awaitPacket(ws);
        let player, handled;
        setTimeout(() => {
            var _a;
            if (!handled) {
                this.initalHandlerLogger.warn(`Disconnecting client ${player ? (_a = player.username) !== null && _a !== void 0 ? _a : `[/${ws._socket.remoteAddress}:${ws._socket.remotePort}` : `[/${ws._socket.remoteAddress}:${ws._socket.remotePort}`} due to connection timing out.`);
                if (player)
                    player.disconnect(`${Enums.ChatColor.YELLOW} Your connection timed out whilst processing handshake, please try again.`);
                else
                    ws.close();
            }
        }, this.LOGIN_TIMEOUT);
        try {
            if (firstPacket.toString() === "Accept: MOTD") {
                if (this.broadcastMotd) {
                    if (this.broadcastMotd._static) {
                        this.broadcastMotd.jsonMotd.data.online = this.players.size;
                        // sample for players
                        this.broadcastMotd.jsonMotd.data.players = [];
                        const playerSample = [...this.players.keys()]
                            .filter(sample => !sample.startsWith("!phs_"))
                            .slice(0, 5);
                        this.broadcastMotd.jsonMotd.data.players = playerSample;
                        if (this.players.size - playerSample.length > 0)
                            this.broadcastMotd.jsonMotd.data.players.push(`${Enums.ChatColor.GRAY}${Enums.ChatColor.ITALIC}(and ${this.players.size - playerSample.length} more)`);
                        const bufferized = this.broadcastMotd.toBuffer();
                        ws.send(bufferized[0]);
                        if (bufferized[1] != null)
                            ws.send(bufferized[1]);
                    }
                    else {
                        const motd = this.broadcastMotd.toBuffer();
                        ws.send(motd[0]);
                        if (motd[1] != null)
                            ws.send(motd[1]);
                    }
                }
                handled = true;
                ws.close();
            }
            else {
                player = new Player(ws);
                const loginPacket = new CSLoginPacket().deserialize(firstPacket);
                player.state = Enums.ClientState.PRE_HANDSHAKE;
                if (loginPacket.gameVersion != VANILLA_PROTOCOL_VERSION) {
                    player.disconnect(`${Enums.ChatColor.RED}Please connect to this proxy on EaglercraftX 1.8.9.`);
                    return;
                }
                else if (loginPacket.networkVersion != NETWORK_VERSION) {
                    player.disconnect(`${Enums.ChatColor.RED}Your EaglercraftX version is too ${loginPacket.networkVersion > NETWORK_VERSION ? "new" : "old"}! Please ${loginPacket.networkVersion > NETWORK_VERSION ? "downgrade" : "update"}.`);
                    return;
                }
                try {
                    Util.validateUsername(loginPacket.username);
                }
                catch (err) {
                    player.disconnect(`${Enums.ChatColor.RED}${err.reason || err}`);
                    return;
                }
                player.username = loginPacket.username;
                player.uuid = Util.generateUUIDFromPlayer(player.username);
                if (this.players.size > this.config.maxConcurrentClients) {
                    player.disconnect(`${Enums.ChatColor.YELLOW}Proxy is full! Please try again later.`);
                    return;
                }
                else if (this.players.get(player.username) != null || this.players.get(`!phs.${player.uuid}`) != null) {
                    player.disconnect(`${Enums.ChatColor.YELLOW}Someone under your username (${player.username}) is already connected to the proxy!`);
                    return;
                }
                this.players.set(`!phs.${player.uuid}`, player);
                this._logger.info(`Player ${loginPacket.username} (${Util.generateUUIDFromPlayer(loginPacket.username)}) running ${loginPacket.brand}/${loginPacket.version} (net ver: ${loginPacket.networkVersion}, game ver: ${loginPacket.gameVersion}) is attempting to connect!`);
                player.write(new SCIdentifyPacket());
                const usernamePacket = await player.read(Enums.PacketId.CSUsernamePacket);
                if (usernamePacket.username !== player.username) {
                    player.disconnect(`${Enums.ChatColor.YELLOW}Failed to complete handshake. Your game version may be too old or too new.`);
                    return;
                }
                const syncUuid = new SCSyncUuidPacket();
                syncUuid.username = player.username;
                syncUuid.uuid = player.uuid;
                player.write(syncUuid);
                const prom = await Promise.all([player.read(Enums.PacketId.CSReadyPacket), await player.read(Enums.PacketId.CSSetSkinPacket)]), skin = prom[1], obj = new EaglerSkins.EaglerSkin();
                obj.owner = player;
                obj.type = skin.skinType;
                if (skin.skinType == Enums.SkinType.CUSTOM)
                    obj.skin = skin.skin;
                else
                    obj.builtInSkin = skin.skinId;
                player.skin = obj;
                player.write(new SCReadyPacket());
                this.players.delete(`!phs.${player.uuid}`);
                this.players.set(player.username, player);
                player.initListeners();
                this._bindListenersToPlayer(player);
                player.state = Enums.ClientState.POST_HANDSHAKE;
                this._logger.info(`Handshake Success! Connecting player ${player.username} to server...`);
                handled = true;
                await player.connect({
                    host: this.config.server.host,
                    port: this.config.server.port,
                    username: player.username
                });
                this._logger.info(`Player ${player.username} successfully connected to server.`);
                this.emit('playerConnect', player);
            }
        }
        catch (err) {
            this.initalHandlerLogger.warn(`Error occurred whilst handling handshake: ${(_a = err.stack) !== null && _a !== void 0 ? _a : err}`);
            handled = true;
            ws.close();
            if (player && player.uuid && this.players.has(`!phs.${player.uuid}`))
                this.players.delete(`!phs.${player.uuid}`);
            if (player && player.uuid && this.players.has(player.username))
                this.players.delete(player.username);
        }
    }
    _bindListenersToPlayer(player) {
        let sentDisconnectMsg = false;
        player.on('disconnect', () => {
            if (this.players.has(player.username))
                this.players.delete(player.username);
            this.initalHandlerLogger.info(`DISCONNECT ${player.username} <=> DISCONNECTED`);
            if (!sentDisconnectMsg)
                this._logger.info(`Player ${player.username} (${player.uuid}) disconnected from the proxy server.`);
        });
        player.on('proxyPacket', async (packet) => {
            if (packet.packetId == Enums.PacketId.CSChannelMessagePacket) {
                try {
                    const msg = packet;
                    if (msg.channel == Constants.EAGLERCRAFT_SKIN_CHANNEL_NAME) {
                        await this.skinServer.handleRequest(msg, player);
                    }
                }
                catch (err) {
                    this._logger.error(`Failed to process channel message packet! Error: ${err.stack || err}`);
                }
            }
        });
        player.on('switchServer', client => {
            this.initalHandlerLogger.info(`SWITCH_SERVER ${player.username} <=> ${client.socket.remoteAddress}:${client.socket.remotePort}`);
        });
        player.on('joinServer', client => {
            this.initalHandlerLogger.info(`SERVER_CONNECTED ${player.username} <=> ${client.socket.remoteAddress}:${client.socket.remotePort}`);
        });
    }
    _pollServer(host, port, interval) {
        ;
        (async () => {
            while (true) {
                const motd = await Motd.MOTD.generateMOTDFromPing(host, port)
                    .catch(err => {
                    var _a;
                    this._logger.warn(`Error polling ${host}:${port} for MOTD: ${(_a = err.stack) !== null && _a !== void 0 ? _a : err}`);
                });
                if (motd)
                    this.broadcastMotd = motd;
                await new Promise(res => setTimeout(res, interval !== null && interval !== void 0 ? interval : Proxy.POLL_INTERVAL));
            }
        })();
    }
    async _handleWSConnectionReq(req, socket, head) {
        var _a;
        const origin = req.headers.origin == null || req.headers.origin == 'null' ? null : req.headers.origin;
        if (!this.config.origins.allowOfflineDownloads && origin == null) {
            socket.destroy();
            return;
        }
        if (this.config.origins.originBlacklist != null && this.config.origins.originBlacklist.some(host => Util.areDomainsEqual(host, origin))) {
            socket.destroy();
            return;
        }
        if (this.config.origins.originWhitelist != null && !this.config.origins.originWhitelist.some(host => Util.areDomainsEqual(host, origin))) {
            socket.destroy();
            return;
        }
        try {
            await this.wsServer.handleUpgrade(req, socket, head, ws => this._handleWSConnection(ws));
        }
        catch (err) {
            this._logger.error(`Error was caught whilst trying to handle WebSocket connection request! Error: ${(_a = err.stack) !== null && _a !== void 0 ? _a : err}`);
            socket.destroy();
        }
    }
    fetchUserByUUID(uuid) {
        for (const [username, player] of this.players) {
            if (player.uuid == uuid)
                return player;
        }
        return null;
    }
}
Proxy.POLL_INTERVAL = 10000;
