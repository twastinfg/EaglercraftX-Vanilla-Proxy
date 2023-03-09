import { Enums } from "../Enums.js";
import { MineProtocol } from "../Protocol.js";
export class CSUsernamePacket {
    constructor() {
        this.packetId = Enums.PacketId.CSUsernamePacket;
        this.type = "packet";
        this.boundTo = Enums.PacketBounds.S;
        this.sentAfterHandshake = false;
    }
    serialize() {
        return Buffer.concat([
            [this.packetId],
            MineProtocol.writeString(this.username),
            MineProtocol.writeString(CSUsernamePacket.DEFAULT),
            [0x0]
        ].map(arr => arr instanceof Uint8Array ? arr : Buffer.from(arr)));
    }
    deserialize(packet) {
        packet = packet.subarray(1);
        const username = MineProtocol.readString(packet);
        this.username = username.value;
        return this;
    }
}
CSUsernamePacket.DEFAULT = "default";
