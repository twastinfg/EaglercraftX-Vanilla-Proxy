import { Enums } from "../../Enums.js";
import { MineProtocol } from "../../Protocol.js";
export class SCChannelMessagePacket {
    constructor() {
        this.packetId = Enums.PacketId.SCChannelMessagePacket;
        this.type = "packet";
        this.boundTo = Enums.PacketBounds.C;
        this.sentAfterHandshake = true;
        this.messageType = Enums.ChannelMessageType.SERVER;
    }
    serialize() {
        return Buffer.concat([
            [this.packetId],
            MineProtocol.writeString(this.channel),
            this.data
        ].map(arr => arr instanceof Uint8Array ? arr : Buffer.from(arr)));
    }
    deserialize(packet) {
        packet = packet.subarray(1);
        const channel = MineProtocol.readString(packet), data = channel.newBuffer;
        this.channel = channel.value;
        this.data = data;
        return this;
    }
}
