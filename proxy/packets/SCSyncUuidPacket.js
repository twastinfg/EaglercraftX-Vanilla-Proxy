import { Enums } from "../Enums.js";
import { MineProtocol } from "../Protocol.js";
import { Util } from "../Util.js";
export class SCSyncUuidPacket {
    constructor() {
        this.packetId = Enums.PacketId.SCSyncUuidPacket;
        this.type = "packet";
        this.boundTo = Enums.PacketBounds.C;
        this.sentAfterHandshake = false;
    }
    serialize() {
        return Buffer.concat([
            [this.packetId],
            MineProtocol.writeString(this.username),
            Util.uuidStringToBuffer(this.uuid)
        ].map(arr => arr instanceof Uint8Array ? arr : Buffer.from(arr)));
    }
    deserialize(packet) {
        packet = packet.subarray(1);
        const username = MineProtocol.readString(packet), uuid = username.newBuffer.subarray(0, 15);
        this.username = username.value;
        this.uuid = Util.uuidBufferToString(uuid);
        return this;
    }
}
