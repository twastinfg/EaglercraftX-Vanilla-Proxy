import { Enums } from "../Enums.js";
export class CSReadyPacket {
    constructor() {
        this.packetId = Enums.PacketId.CSReadyPacket;
        this.type = "packet";
        this.boundTo = Enums.PacketBounds.S;
        this.sentAfterHandshake = false;
    }
    serialize() {
        return Buffer.from([this.packetId]);
    }
    deserialize(packet) {
        return this;
    }
}
