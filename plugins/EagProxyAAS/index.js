import metadata from "./metadata.json" assert { type: "json" };
import { config } from "./config.js";
import { createServer } from "minecraft-protocol";
import { ConnectionState } from "./types.js";
import { handleConnect, setSG } from "./utils.js";
const PluginManager = PLUGIN_MANAGER;
const Logger = PluginManager.Logger;
const Enums = PluginManager.Enums;
const Chat = PluginManager.Chat;
const Constants = PluginManager.Constants;
const Motd = PluginManager.Motd;
const Player = PluginManager.Player;
const MineProtocol = PluginManager.MineProtocol;
const EaglerSkins = PluginManager.EaglerSkins;
const Util = PluginManager.Util;
const logger = new Logger("EaglerProxyAAS");
logger.info(`Starting ${metadata.name} v${metadata.version}...`);
logger.info(`(internal server port: ${config.bindInternalServerPort}, internal server IP: ${config.bindInternalServerPort})`);
logger.info("Starting internal server...");
let server = createServer({
    host: config.bindInternalServerIp,
    port: config.bindInternalServerPort,
    motdMsg: `${Enums.ChatColor.GOLD}EaglerProxy as a Service ${Enums.ChatColor.GRAY}| ${Enums.ChatColor.RED}Play on any vanilla 1.8.9 server`,
    "online-mode": false,
    version: '1.8.9'
}), sGlobals = {
    server: server,
    players: new Map()
};
setSG(sGlobals);
server.on('login', client => {
    logger.info(`Client ${client.username} has connected to the authentication server.`);
    client.on('end', () => {
        sGlobals.players.delete(client.username);
        logger.info(`Client ${client.username} has disconnected from the authentication server.`);
    });
    const cs = {
        state: ConnectionState.AUTH,
        gameClient: client,
        token: null,
        lastStatusUpdate: null
    };
    sGlobals.players.set(client.username, cs);
    handleConnect(cs);
});
logger.info("Redirecting backend server IP... (this is required for the plugin to function)");
CONFIG.adapter.server = {
    host: config.bindInternalServerIp,
    port: config.bindInternalServerPort
};
