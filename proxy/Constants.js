export var Constants;
(function (Constants) {
    Constants.EAGLERCRAFT_SKIN_CHANNEL_NAME = "EAG|Skins-1.8";
    Constants.MAGIC_ENDING_SERVER_SKIN_DOWNLOAD_BUILTIN = [0x00, 0x00, 0x00];
    Constants.MAGIC_ENDING_CLIENT_UPLOAD_SKIN_BUILTIN = [0x00, 0x05, 0x01, 0x00, 0x00, 0x00];
    Constants.EAGLERCRAFT_SKIN_CUSTOM_LENGTH = 64 ** 2 * 4;
    Constants.JOIN_SERVER_PACKET = 0x01;
    Constants.PLAYER_LOOK_PACKET = 0x08;
})(Constants || (Constants = {}));
