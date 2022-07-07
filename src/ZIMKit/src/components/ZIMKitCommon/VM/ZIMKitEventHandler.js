import { EventName } from '../Constant/event';
export default class ZIMKitEventHandler {
    constructor() {
        this.eventList = {
            [EventName.zimError]: [],
            [EventName.zimConnectionStateChanged]: [],
            [EventName.zimTokenWillExpire]: [],
            [EventName.zimReceivePeerMessage]: [],
            [EventName.zimReceiveGroupMessage]: [],
            [EventName.zimConversationTotalUnreadMessageCountUpdated]: [],
            [EventName.zimConversationChanged]: [],
            [EventName.zimKitIsLoggedIn]: [],
            [EventName.zimKitLoginUserUpdate]: [],
            [EventName.zimKitDeleteConversation]: [],
            [EventName.zimKitConversationListUpdate]: [],
            [EventName.zimKitCurrentConversationUpdate]: [],
            [EventName.zimKitConversationListQueryAbnormally]: [],
            [EventName.zimKitCreateGroup]: [],
            [EventName.zimKitCurrentChatUpdated]: [],
            [EventName.zimKitCurrentMessageListUpdated]: [],
            [EventName.zimKitCurrentGroupInfoUpdated]: []
        };
        if (!ZIMKitEventHandler.instance) {
            ZIMKitEventHandler.instance = this;
        }
        return ZIMKitEventHandler.instance;
    }
    static getInstance() {
        if (!ZIMKitEventHandler.instance) {
            ZIMKitEventHandler.instance = new ZIMKitEventHandler();
        }
        return ZIMKitEventHandler.instance;
    }
    addEventListener(event, callBackList) {
        if (!this.eventList[event]) {
            return false;
        }
        if (!Array.isArray(callBackList)) {
            return false;
        }
        callBackList.forEach(callBack => {
            !this.eventList[event].includes(callBack) &&
                this.eventList[event].push(callBack);
        });
        return true;
    }
    removeEventListener(event, callBackList) {
        if (!this.eventList[event]) {
            return false;
        }
        const li = this.eventList[event];
        if (callBackList && callBackList.length) {
            callBackList.forEach(callBack => {
                li.splice(li.indexOf(callBack), 1);
            });
        }
        else {
            this.eventList[event] = [];
        }
        return true;
    }
    actionListener(event, ...args) {
        this.eventList[event] &&
            this.eventList[event].forEach(func => {
                func(...args);
            });
    }
}
