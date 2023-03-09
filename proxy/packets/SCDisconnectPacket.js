import { Chat } from "../Chat.js";
import { Enums } from "../Enums.js";
import { MineProtocol } from "../Protocol.js";
export default class SCDisconnectPacket {
    constructor() {
        this.packetId = Enums.PacketId.SCDisconnectPacket;
        this.type = "packet";
        this.boundTo = Enums.PacketBounds.C;
        this.sentAfterHandshake = false;
    }
    serialize() {
        const msg = (typeof this.reason == 'string' ? this.reason : Chat.chatToPlainString(this.reason));
        return Buffer.concat([
            [0xff],
            MineProtocol.writeVarInt(SCDisconnectPacket.REASON),
            MineProtocol.writeString(" " + msg + " ")
        ].map(arr => arr instanceof Uint8Array ? arr : Buffer.from(arr)));
    }
    deserialize(packet) {
        if (packet[0] != this.packetId)
            throw new Error("Invalid packet ID!");
        packet = packet.subarray(1 + MineProtocol.writeVarInt(SCDisconnectPacket.REASON).length);
        const reason = MineProtocol.readString(packet);
        this.reason = reason.value;
        return this;
    }
}
SCDisconnectPacket.REASON = 0x8;
