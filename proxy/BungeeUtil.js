import { Logger } from "../logger.js";
import mcp, { states } from "minecraft-protocol";
const { createSerializer, createDeserializer } = mcp;
export var BungeeUtil;
(function (BungeeUtil) {
    class PacketUUIDTranslator {
        constructor(ssPlayerUUID, csPlayerUUID) {
            this.serverSidePlayerUUID = ssPlayerUUID;
            this.clientSidePlayerUUID = csPlayerUUID;
            this._logger = new Logger("PacketTranslator");
            this._serverSerializer = createSerializer({
                state: states.PLAY,
                isServer: true,
                version: "1.8.8",
                customPackets: null
            });
            this._clientSerializer = createSerializer({
                state: states.PLAY,
                isServer: false,
                version: "1.8.8",
                customPackets: null
            });
            this._clientDeserializer = createDeserializer({
                state: states.PLAY,
                isServer: false,
                version: "1.8.8",
                customPackets: null
            });
            this._serverDeserializer = createDeserializer({
                state: states.PLAY,
                isServer: true,
                version: "1.8.8",
                customPackets: null
            });
        }
        onClientWrite(packet) {
            const { name, params } = this._serverDeserializer.parsePacketBuffer(packet).data;
            return this._clientSerializer.createPacketBuffer(this._translatePacketClient(params, { name }));
        }
        onServerWrite(packet, meta) {
            return this._serverSerializer.createPacketBuffer(this._translatePacketServer(packet, meta));
        }
        _translatePacketClient(packet, meta) {
            if (PacketUUIDTranslator.CAST_UUID_CLIENT.some(id => id == meta.name)) {
                if (meta.name == 'spectate') {
                    if (packet.target == this.clientSidePlayerUUID) {
                        packet.target = this.serverSidePlayerUUID;
                    }
                    else if (packet.target == this.serverSidePlayerUUID) {
                        packet.target = this.clientSidePlayerUUID;
                    }
                }
            }
            return {
                name: meta.name,
                params: packet
            };
        }
        _translatePacketServer(packet, meta) {
            if (PacketUUIDTranslator.CAST_UUID_SERVER.some(id => id == meta.name)) {
                if (meta.name == 'update_attributes') {
                    for (const prop of packet.properties) {
                        for (const modifier of prop.modifiers) {
                            if (modifier.uuid == this.serverSidePlayerUUID) {
                                modifier.uuid = this.clientSidePlayerUUID;
                            }
                            else if (modifier.uuid == this.clientSidePlayerUUID) {
                                modifier.uuid = this.serverSidePlayerUUID;
                            }
                        }
                    }
                }
                else if (meta.name == 'named_entity_spawn') {
                    if (packet.playerUUID == this.serverSidePlayerUUID) {
                        packet.playerUUID = this.clientSidePlayerUUID;
                    }
                    else if (packet.playerUUID == this.clientSidePlayerUUID) {
                        packet.playerUUID = this.serverSidePlayerUUID;
                    }
                }
                else if (meta.name == 'player_info') {
                    for (const player of packet.data) {
                        if (player.UUID == this.serverSidePlayerUUID) {
                            player.UUID = this.clientSidePlayerUUID;
                        }
                        else if (player.UUID == this.clientSidePlayerUUID) {
                            player.UUID = this.serverSidePlayerUUID;
                        }
                    }
                }
            }
            return {
                name: meta.name,
                params: packet
            };
        }
    }
    PacketUUIDTranslator.CAST_UUID_SERVER = [
        'update_attributes',
        'named_entity_spawn',
        // drop this packet (twitch.tv integration not available anymore)
        'player_info'
    ];
    PacketUUIDTranslator.CAST_UUID_CLIENT = [
        'spectate'
    ];
    BungeeUtil.PacketUUIDTranslator = PacketUUIDTranslator;
    function getRespawnSequence(login, serializer) {
        const dimset = getDimSets(login.dimension);
        return [
            serializer.createPacketBuffer({
                name: 'respawn',
                params: {
                    dimension: dimset[0],
                    difficulty: login.difficulty,
                    gamemode: login.gameMode,
                    levelType: login.levelType
                }
            }),
            serializer.createPacketBuffer({
                name: 'respawn',
                params: {
                    dimension: dimset[1],
                    difficulty: login.difficulty,
                    gamemode: login.gameMode,
                    levelType: login.levelType
                }
            })
        ];
    }
    BungeeUtil.getRespawnSequence = getRespawnSequence;
    function getDimSets(loginDim) {
        return [
            loginDim == -1 ? 0 : loginDim == 0 ? -1 : loginDim == 1 ? 0 : 0,
            loginDim
        ];
    }
})(BungeeUtil || (BungeeUtil = {}));
