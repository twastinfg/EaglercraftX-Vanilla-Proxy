import { Enums } from "../Enums.js";
export class SCReadyPacket {
    constructor() {
        this.packetId = Enums.PacketId.SCReadyPacket;
        this.type = "packet";
        this.boundTo = Enums.PacketBounds.C;
        this.sentAfterHandshake = false;
    }
    serialize() {
        return Buffer.from([this.packetId]);
    }
    deserialize(packet) {
        return this;
    }
}
