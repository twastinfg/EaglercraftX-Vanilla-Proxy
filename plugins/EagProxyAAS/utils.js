import * as Chunk from "prismarine-chunk";
import * as Block from "prismarine-block";
import * as Registry from "prismarine-registry";
import vec3 from "vec3";
import { ConnectionState } from "./types.js";
import { auth } from "./auth.js";
const { Vec3 } = vec3;
const Enums = PLUGIN_MANAGER.Enums;
const Util = PLUGIN_MANAGER.Util;
const MAX_LIFETIME_CONNECTED = 10 * 60 * 1000, MAX_LIFETIME_AUTH = 5 * 60 * 1000, MAX_LIFETIME_LOGIN = 1 * 60 * 1000;
const REGISTRY = Registry.default('1.8.8'), McBlock = Block.default('1.8.8'), LOGIN_CHUNK = generateSpawnChunk().dump();
const logger = new PLUGIN_MANAGER.Logger("PlayerHandler");
let SERVER = null;
export function setSG(svr) {
    SERVER = svr;
}
export function disconectIdle() {
    SERVER.players.forEach(client => {
        if (client.state == ConnectionState.AUTH && (Date.now() - client.lastStatusUpdate) > MAX_LIFETIME_AUTH) {
            client.gameClient.end("Timed out waiting for user to login via Microsoft");
        }
        else if (client.state == ConnectionState.SUCCESS && (Date.now() - client.lastStatusUpdate) > MAX_LIFETIME_CONNECTED) {
            client.gameClient.end(Enums.ChatColor.RED + "Please enter the IP of the server you'd like to connect to in chat.");
        }
    });
}
export function handleConnect(client) {
    client.gameClient.write('login', {
        entityId: 1,
        gameMode: 2,
        dimension: 0,
        difficulty: 1,
        maxPlayers: 1,
        levelType: 'flat',
        reducedDebugInfo: false
    });
    client.gameClient.write('map_chunk', {
        x: 0,
        z: 0,
        groundUp: true,
        bitMap: 0xFFFF,
        chunkData: LOGIN_CHUNK
    });
    client.gameClient.write('position', {
        x: 0,
        y: 65,
        z: 8.5,
        yaw: -90,
        pitch: 0,
        flags: 0x01
    });
    client.gameClient.write('playerlist_header', {
        header: JSON.stringify({
            text: ` ${Enums.ChatColor.GOLD}EaglerProxy Authentication Server `
        }),
        footer: JSON.stringify({
            text: `${Enums.ChatColor.GOLD}Please wait for instructions.`
        })
    });
    onConnect(client);
}
export function awaitCommand(client, filter) {
    return new Promise((res, rej) => {
        const onMsg = packet => {
            if (filter(packet.message)) {
                client.removeListener('chat', onMsg);
                client.removeListener('end', onEnd);
                res(packet.message);
            }
        };
        const onEnd = () => rej("Client disconnected before promise could be resolved");
        client.on('chat', onMsg);
        client.on('end', onEnd);
    });
}
export function sendMessage(client, msg) {
    client.write('chat', {
        message: JSON.stringify({ text: msg }),
        position: 1
    });
}
export function sendMessageWarning(client, msg) {
    client.write('chat', {
        message: JSON.stringify({
            text: msg,
            color: 'yellow'
        }),
        position: 1
    });
}
export function sendMessageLogin(client, url, token) {
    client.write('chat', {
        message: JSON.stringify({
            text: "Please go to ",
            color: Enums.ChatColor.RESET,
            extra: [
                {
                    text: url,
                    color: 'gold',
                    clickEvent: {
                        action: "open_url",
                        value: url
                    },
                    hoverEvent: {
                        action: "show_text",
                        value: Enums.ChatColor.GOLD + "Click to open me in a new window!"
                    }
                },
                {
                    text: " and login via the code "
                },
                {
                    text: token,
                    color: 'gold'
                },
                {
                    text: "."
                }
            ]
        }),
        position: 1
    });
}
export function updateState(client, newState, uri, code) {
    switch (newState) {
        case 'AUTH':
            if (code == null || uri == null)
                throw new Error("Missing code/uri required for title message type AUTH");
            client.write('playerlist_header', {
                header: JSON.stringify({
                    text: ` ${Enums.ChatColor.GOLD}EaglerProxy Authentication Server `
                }),
                footer: JSON.stringify({
                    text: `${Enums.ChatColor.RED}${uri}${Enums.ChatColor.GOLD} | Code: ${Enums.ChatColor.RED}${code}`
                })
            });
            break;
        case 'SERVER':
            client.write('playerlist_header', {
                header: JSON.stringify({
                    text: ` ${Enums.ChatColor.GOLD}EaglerProxy Authentication Server `
                }),
                footer: JSON.stringify({
                    text: `${Enums.ChatColor.RED}/join <ip> [port]`
                })
            });
            break;
    }
}
export async function onConnect(client) {
    try {
        client.state = ConnectionState.AUTH;
        client.lastStatusUpdate = Date.now();
        sendMessageWarning(client.gameClient, `WARNING: This proxy allows you to connect to any 1.8.9 server. Gameplay has shown no major issues, but please note that EaglercraftX may flag some anticheats while playing. You also may or may not get security banned when connecting to Hypixel.`);
        await new Promise(res => setTimeout(res, 3000));
        sendMessageWarning(client.gameClient, `WARNING: It is highly suggested that you turn down settings, as gameplay tends to be very laggy and unplayable on low powered devices.`);
        await new Promise(res => setTimeout(res, 3000));
        sendMessageWarning(client.gameClient, `WARNING: You will be prompted to log in via Microsoft to obtain a session token necessary to join games. Any data related to your account will not be saved and for transparency reasons this proxy's source code is available on Repl.it at @WorldEditAxe/EaglercraftX-Vanilla Proxy.`);
        await new Promise(res => setTimeout(res, 3000));
        client.lastStatusUpdate = Date.now();
        let errored = false, savedAuth;
        const authHandler = auth(), codeCallback = (code) => {
            updateState(client.gameClient, 'AUTH', code.verification_uri, code.user_code);
            sendMessageLogin(client.gameClient, code.verification_uri, code.user_code);
        };
        authHandler.once('error', err => {
            if (!client.gameClient.ended)
                client.gameClient.end(err.message);
            errored = true;
        });
        if (errored)
            return;
        authHandler.on('code', codeCallback);
        await new Promise(res => authHandler.once('done', result => {
            savedAuth = result;
            res(result);
        }));
        sendMessage(client.gameClient, Enums.ChatColor.BRIGHT_GREEN + "Successfully logged into Minecraft!");
        client.state = ConnectionState.SUCCESS;
        client.lastStatusUpdate = Date.now();
        updateState(client.gameClient, 'SERVER');
        sendMessage(client.gameClient, `Provide a server to join. ${Enums.ChatColor.GOLD}/join <ip> [port]${Enums.ChatColor.RESET}.`);
        let host, port;
        while (true) {
            const msg = await awaitCommand(client.gameClient, msg => msg.startsWith("/join")), parsed = msg.split(/ /gi, 3);
            if (parsed.length < 2)
                sendMessage(client.gameClient, `Please provide a server to connect to. ${Enums.ChatColor.GOLD}/join <ip> [port]${Enums.ChatColor.RESET}.`);
            else if (parsed.length > 3 && isNaN(parseInt(parsed[2])))
                sendMessage(client.gameClient, `A valid port number has to be passed! ${Enums.ChatColor.GOLD}/join <ip> [port]${Enums.ChatColor.RESET}.`);
            else {
                host = parsed[1];
                if (parsed.length > 3)
                    port = parseInt(parsed[2]);
                port = port !== null && port !== void 0 ? port : 25565;
                break;
            }
        }
        try {
            await PLUGIN_MANAGER.proxy.players.get(client.gameClient.username).switchServers({
                host: host,
                port: port,
                version: "1.8.8",
                username: savedAuth.selectedProfile.name,
                auth: 'mojang',
                keepAlive: false,
                session: {
                    accessToken: savedAuth.accessToken,
                    clientToken: savedAuth.selectedProfile.id,
                    selectedProfile: {
                        id: savedAuth.selectedProfile.id,
                        name: savedAuth.selectedProfile.name
                    }
                },
                skipValidation: true,
                hideErrors: true
            });
        }
        catch (err) {
            if (!client.gameClient.ended) {
                client.gameClient.end(Enums.ChatColor.RED + `Something went wrong whilst switching servers: ${err.message}`);
            }
        }
    }
    catch (err) {
        if (!client.gameClient.ended) {
            logger.error(`Error whilst processing user ${client.gameClient.username}: ${err.stack || err}`);
            client.gameClient.end(Enums.ChatColor.YELLOW + "Something went wrong whilst processing your request. Please reconnect.");
        }
    }
}
export function generateSpawnChunk() {
    const chunk = new (Chunk.default(REGISTRY))(null);
    chunk.initialize(() => new McBlock(REGISTRY.blocksByName.air.id, REGISTRY.biomesByName.plains.id, 0));
    chunk.setBlock(new Vec3(8, 64, 8), new McBlock(REGISTRY.blocksByName.barrier.id, REGISTRY.biomesByName.plains.id, 0));
    chunk.setBlock(new Vec3(8, 67, 8), new McBlock(REGISTRY.blocksByName.barrier.id, REGISTRY.biomesByName.plains.id, 0));
    chunk.setBlock(new Vec3(7, 65, 8), new McBlock(REGISTRY.blocksByName.barrier.id, REGISTRY.biomesByName.plains.id, 0));
    chunk.setBlock(new Vec3(7, 66, 8), new McBlock(REGISTRY.blocksByName.barrier.id, REGISTRY.biomesByName.plains.id, 0));
    chunk.setBlock(new Vec3(9, 65, 8), new McBlock(REGISTRY.blocksByName.barrier.id, REGISTRY.biomesByName.plains.id, 0));
    chunk.setBlock(new Vec3(9, 66, 8), new McBlock(REGISTRY.blocksByName.barrier.id, REGISTRY.biomesByName.plains.id, 0));
    chunk.setBlock(new Vec3(8, 65, 7), new McBlock(REGISTRY.blocksByName.barrier.id, REGISTRY.biomesByName.plains.id, 0));
    chunk.setBlock(new Vec3(8, 66, 7), new McBlock(REGISTRY.blocksByName.barrier.id, REGISTRY.biomesByName.plains.id, 0));
    chunk.setBlock(new Vec3(8, 65, 9), new McBlock(REGISTRY.blocksByName.barrier.id, REGISTRY.biomesByName.plains.id, 0));
    chunk.setBlock(new Vec3(8, 66, 9), new McBlock(REGISTRY.blocksByName.barrier.id, REGISTRY.biomesByName.plains.id, 0));
    chunk.setSkyLight(new Vec3(8, 66, 8), 15);
    return chunk;
}
