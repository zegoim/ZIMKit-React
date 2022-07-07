export default class ZIMKitMessageModel {
    constructor(message) {
        this.type = message.type;
        this.messageID = message.messageID;
        this.timestamp = message.timestamp;
        this.message = message.message;
        this.senderUserID = message.senderUserID;
        this.conversationID = message.conversationID;
        this.conversationType = message.conversationType;
        this.direction = message.direction;
        this.sentStatus = message.sentStatus;
        this.orderKey = message.orderKey;
        this.conversationSeq = message.conversationSeq;
    }
}
export var ZIMKitMessageType;
(function (ZIMKitMessageType) {
    ZIMKitMessageType[ZIMKitMessageType["Tip"] = 99] = "Tip";
})(ZIMKitMessageType || (ZIMKitMessageType = {}));
