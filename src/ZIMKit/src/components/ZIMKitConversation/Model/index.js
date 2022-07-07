export default class ZIMKitConversationModel {
    constructor(conversation) {
        this.conversationID = conversation.conversationID;
        this.conversationName = conversation.conversationName;
        this.type = conversation.type;
        this.unreadMessageCount = conversation.unreadMessageCount;
        this.lastMessage = conversation.lastMessage;
        this.orderKey = conversation.orderKey;
        this.notificationStatus = conversation.notificationStatus;
    }
}
