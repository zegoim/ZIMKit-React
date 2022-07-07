import { EventName } from '../../ZIMKitCommon/Constant/event';
import ZIMKitEventHandler from '../../ZIMKitCommon/VM/ZIMKitEventHandler';
import ZIMKitManager from '../../ZIMKitCommon/VM/ZIMKitManager';
import ZIMKitMessageModel from '../Model';
import ZIMKiti18n from '../../../plugin/i18n';
const i18n = ZIMKiti18n.getInstance().getI18next();
export default class ZIMKitMessageVM {
    constructor() {
        this.eventHandler = ZIMKitEventHandler.getInstance();
        this.messageCount = 30;
        this.messageIndex = 31;
        this.currentChat = {};
        this.currentMessageList = [];
        if (!ZIMKitMessageVM.instance) {
            ZIMKitMessageVM.instance = this;
            ZIMKitMessageVM.instance.initListenerHandle();
        }
        return ZIMKitMessageVM.instance;
    }
    static getInstance() {
        if (!ZIMKitMessageVM.instance) {
            ZIMKitMessageVM.instance = new ZIMKitMessageVM();
        }
        return ZIMKitMessageVM.instance;
    }
    initListenerHandle() {
        this.eventHandler.addEventListener(EventName.zimReceivePeerMessage, [
            data => {
                if (this.currentChat.conversationID === data.fromConversationID) {
                    data.messageList.forEach(item => {
                        this.currentMessageList.push(new ZIMKitMessageModel(item));
                    });
                    this.eventHandler.actionListener(EventName.zimKitCurrentMessageListUpdated, this.currentMessageList);
                    this.eventHandler.actionListener(EventName.zimKitCurrentChatUpdated, this.currentChat);
                }
            }
        ]);
        this.eventHandler.addEventListener(EventName.zimReceiveGroupMessage, [
            data => {
                if (this.currentChat.conversationID === data.fromConversationID) {
                    data.messageList.forEach(item => {
                        this.currentMessageList.push(new ZIMKitMessageModel(item));
                    });
                    this.eventHandler.actionListener(EventName.zimKitCurrentMessageListUpdated, this.currentMessageList);
                    this.eventHandler.actionListener(EventName.zimKitCurrentChatUpdated, this.currentChat);
                }
            }
        ]);
        this.eventHandler.addEventListener(EventName.zimKitDeleteConversation, [
            conversationID => {
                if (conversationID === this.currentChat.conversationID) {
                    this.currentMessageList = [];
                    this.currentChat = {};
                    this.eventHandler.actionListener(EventName.zimKitCurrentMessageListUpdated, this.currentMessageList);
                    this.eventHandler.actionListener(EventName.zimKitCurrentChatUpdated, this.currentChat);
                }
            }
        ]);
        this.eventHandler.addEventListener(EventName.zimKitCurrentConversationUpdate, [
            conversation => {
                if (!conversation ||
                    (this.currentChat.conversationID &&
                        conversation.conversationID === this.currentChat.conversationID))
                    return;
                this.currentChat = conversation;
                this.messageCount = 30;
                this.currentMessageList.length = 0;
                console.time();
                this.queryHistoryMessage(this.currentChat.conversationID, this.currentChat.type);
                this.eventHandler.actionListener(EventName.zimKitCurrentChatUpdated, this.currentChat);
            }
        ]);
    }
    queryHistoryMessage(conversationID, conversationType) {
        const config = {
            nextMessage: undefined,
            count: this.messageCount,
            reverse: true
        };
        return ZIMKitManager.getInstance()
            .zim.queryHistoryMessage(conversationID, conversationType, config)
            .then(data => {
            console.timeEnd();
            this.currentMessageList = [];
            if (data.messageList.length) {
                data.messageList.forEach(item => {
                    this.currentMessageList.push(new ZIMKitMessageModel(item));
                });
            }
            this.eventHandler.actionListener(EventName.zimKitCurrentMessageListUpdated, this.currentMessageList);
        });
    }
    clearCurrentMessageList() {
        this.currentMessageList = [];
        this.eventHandler.actionListener(EventName.zimKitCurrentMessageListUpdated, this.currentMessageList);
    }
    sendPeerMessage(message) {
        const config = { priority: 1 };
        return ZIMKitManager.getInstance()
            .zim.sendPeerMessage(message, this.currentChat.conversationID, config)
            .then(res => {
            this.currentMessageList.push(new ZIMKitMessageModel(res.message));
        })
            .catch((error) => {
            const msg = {
                type: 1,
                messageID: String(new Date().getTime()),
                message: message.message,
                timestamp: new Date().getTime(),
                senderUserID: ZIMKitManager.getInstance().userInfo.userID,
                conversationID: '',
                conversationType: 0,
                direction: 0,
                sentStatus: 2,
                orderKey: 0,
                conversationSeq: 0
            };
            this.currentMessageList.push(new ZIMKitMessageModel(msg));
            switch (error.code) {
                case 6000204:
                    const tipMsg = {
                        type: 99,
                        messageID: String(new Date().getTime()),
                        message: `${i18n
                            .t('message_user_not_exit_please_again')
                            .replace('%s', this.currentChat.conversationID)}`,
                        timestamp: new Date().getTime(),
                        senderUserID: ZIMKitManager.getInstance().userInfo.userID,
                        conversationID: '',
                        conversationType: 0,
                        direction: 0,
                        sentStatus: 2,
                        orderKey: 0,
                        conversationSeq: 0
                    };
                    this.currentMessageList.push(new ZIMKitMessageModel(tipMsg));
                    break;
                default:
                    break;
            }
        })
            .finally(() => {
            this.eventHandler.actionListener(EventName.zimKitCurrentChatUpdated, this.currentChat);
            this.eventHandler.actionListener(EventName.zimKitCurrentMessageListUpdated, this.currentMessageList);
        });
    }
    sendGroupMessage(message) {
        const config = { priority: 1 };
        return ZIMKitManager.getInstance()
            .zim.sendGroupMessage(message, this.currentChat.conversationID, config)
            .then(res => {
            this.currentMessageList.push(new ZIMKitMessageModel(res.message));
        })
            .catch(() => {
            const msg = {
                type: 1,
                messageID: String(new Date().getTime()),
                message: message.message,
                timestamp: new Date().getTime(),
                senderUserID: ZIMKitManager.getInstance().userInfo.userID,
                conversationID: '',
                conversationType: 0,
                direction: 0,
                sentStatus: 2,
                orderKey: 0,
                conversationSeq: 0
            };
            this.currentMessageList.push(new ZIMKitMessageModel(msg));
        })
            .finally(() => {
            this.eventHandler.actionListener(EventName.zimKitCurrentChatUpdated, this.currentChat);
            this.eventHandler.actionListener(EventName.zimKitCurrentMessageListUpdated, this.currentMessageList);
        });
    }
    unInit() {
        this.currentChat = {};
        this.currentMessageList.length = 0;
    }
    registerLoginUserUpdatedCallback(callback) {
        this.eventHandler.addEventListener(EventName.zimKitLoginUserUpdate, [
            callback
        ]);
    }
    registerCurrentChatUpdatedCallback(callback) {
        this.eventHandler.addEventListener(EventName.zimKitCurrentChatUpdated, [
            callback
        ]);
    }
    registerMessageListUpdatedCallback(callback) {
        this.eventHandler.addEventListener(EventName.zimKitCurrentMessageListUpdated, [callback]);
    }
}
