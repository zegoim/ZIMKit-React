import ZIMKitManager from '../../ZIMKitCommon/VM/ZIMKitManager';
import ZIMKitEventHandler from '../../ZIMKitCommon/VM/ZIMKitEventHandler';
import ZIMKitConversationModel from '../Model';
import { EventName } from '../../ZIMKitCommon/Constant/event';
export default class ZIMKitConversationVM {
    constructor() {
        this.eventHandler = ZIMKitEventHandler.getInstance();
        this.pagePullCount = 100;
        this.conversationList = [];
        this.totalUnreadMessageCount = 0;
        this.isAbnormal = false;
        this.activeCvID = '';
        this.loadStatus = 0;
        if (!ZIMKitConversationVM.instance) {
            ZIMKitConversationVM.instance = this;
            ZIMKitConversationVM.instance.initListenerHandle();
        }
        return ZIMKitConversationVM.instance;
    }
    static getInstance() {
        if (!ZIMKitConversationVM.instance) {
            ZIMKitConversationVM.instance = new ZIMKitConversationVM();
        }
        return ZIMKitConversationVM.instance;
    }
    initListenerHandle() {
        this.eventHandler.addEventListener(EventName.zimConversationTotalUnreadMessageCountUpdated, [
            (data) => {
                this.totalUnreadMessageCount = data.totalUnreadMessageCount;
            }
        ]);
        this.eventHandler.addEventListener(EventName.zimConversationChanged, [
            (data) => {
                if (this.loadStatus !== 2) {
                    return;
                }
                let updateListFlag = false;
                let updateCurrentFlag = false;
                data.infoList.forEach(info => {
                    switch (info.event) {
                        case 1:
                            if (this.conversationList.length) {
                                let isExist = false;
                                this.conversationList.forEach((item) => {
                                    if (item.conversationID === info.conversation.conversationID) {
                                        isExist = true;
                                        Object.assign(item, info.conversation);
                                        if (this.activeCvID === info.conversation.conversationID) {
                                            updateCurrentFlag = true;
                                        }
                                        updateListFlag = true;
                                    }
                                });
                                if (!isExist) {
                                    this.conversationList.push(info.conversation);
                                    updateListFlag = true;
                                }
                            }
                            else {
                                this.conversationList.push(info.conversation);
                                this.activeCvID = info.conversation.conversationID;
                                updateListFlag = true;
                                updateCurrentFlag = true;
                            }
                            break;
                        case 0:
                            const len = this.conversationList.length;
                            updateListFlag = this.insetConversationList(info.conversation);
                            if (!len) {
                                this.activeCvID = info.conversation.conversationID;
                                updateCurrentFlag = true;
                            }
                            break;
                        default:
                            break;    
                    }
                });
                if (updateListFlag) {
                    this.sortCvListHandle();
                    this.eventHandler.actionListener(EventName.zimKitConversationListUpdate, this.conversationList);
                }
                if (updateCurrentFlag) {
                    const currentConversation = this.getConversationByID(this.activeCvID);
                    this.eventHandler.actionListener(EventName.zimKitCurrentConversationUpdate, currentConversation);
                    currentConversation.unreadMessageCount &&
                        this.clearConversationUnreadMessageCount(currentConversation.conversationID, currentConversation.type);
                }
            }
        ]);
    }
    loadConversationList() {
        const config = {
            nextConversation: undefined,
            count: localStorage.count || this.pagePullCount
        };
        if (this.loadStatus === 1) {
            return Promise.reject();
        } 
        this.loadStatus = 1;
        return ZIMKitManager.getInstance()
            .zim.queryConversationList(config)
            .then((data) => {
            console.warn('zimkit react loadConversationList', data.conversationList);
            this.loadStatus = 2;
            this.isAbnormal = false;
            this.conversationList.length = 0;
            data.conversationList.forEach((item) => {
                if (item.type === 0 || item.type === 2) {
                    this.conversationList.push(new ZIMKitConversationModel(item));
                }
            });
            this.sortCvListHandle();
            if (this.conversationList.length && !this.activeCvID) {
                const firstConversation = this.conversationList[0];
                this.activeCvID = firstConversation.conversationID;
                this.clearConversationUnreadMessageCount(firstConversation.conversationID, firstConversation.type);
            }
            this.eventHandler.actionListener(EventName.zimKitConversationListUpdate, this.conversationList);
            this.eventHandler.actionListener(EventName.zimKitCurrentConversationUpdate, this.getConversationByID(this.activeCvID));
            this.eventHandler.actionListener(EventName.zimKitConversationListQueryAbnormally, false);
        })
        .catch((error) => {
            this.loadStatus = 2;
            this.isAbnormal = true;
            this.eventHandler.actionListener(EventName.zimKitConversationListQueryAbnormally, true);
        });
    }
    setCurrentConversation(conversationID) {
        this.activeCvID = conversationID;
        this.eventHandler.actionListener(EventName.zimKitCurrentConversationUpdate, this.getConversationByID(conversationID));
    }
    setTempConversation(conversation) {
        this.activeCvID = conversation.conversationID;
        this.eventHandler.actionListener(EventName.zimKitCurrentConversationUpdate, conversation);
    }
    loadNextPage() {
        const config = {
            nextConversation: this.conversationList[this.conversationList.length - 1],
            count: this.pagePullCount
        };
        ZIMKitManager.getInstance()
            .zim.queryConversationList(config)
            .then((data) => {
            console.warn('zimkit react loadNextPage', data.conversationList);
            data.conversationList.forEach((item) => {
                if (item.type === 0 || item.type === 2) {
                    this.conversationList.push(new ZIMKitConversationModel(item));
                }
            });
            this.sortCvListHandle();
            this.eventHandler.actionListener(EventName.zimKitConversationListUpdate, this.conversationList);
        });
    }
    deleteConversation(conversationID, conversationType) {
        const config = { isAlsoDeleteServerConversation: true };
        return ZIMKitManager.getInstance()
            .zim.deleteConversation(conversationID, conversationType, config)
            .then((data) => {
            this.conversationList.forEach((item, index) => {
                if (item.conversationID === data.conversationID) {
                    this.conversationList.splice(index, 1);
                }
            });
            if (conversationID === this.activeCvID &&
                this.conversationList.length) {
                this.activeCvID = this.conversationList[0].conversationID;
                this.eventHandler.actionListener(EventName.zimKitCurrentConversationUpdate, this.conversationList[0]);
            }
            this.eventHandler.actionListener(EventName.zimKitConversationListUpdate, this.conversationList);
            this.eventHandler.actionListener(EventName.zimKitDeleteConversation, conversationID);
            return data;
        });
    }
    removeData() { }
    clearConversationUnreadMessageCount(conversationID, conversationType) {
        return ZIMKitManager.getInstance()
            .zim.clearConversationUnreadMessageCount(conversationID, conversationType)
            .catch((error) => {
            console.error(error);
        });
    }
    registerIsLoggedInCallback(callback) {
        this.eventHandler.addEventListener(EventName.zimKitIsLoggedIn, [callback]);
    }
    registerCvTotalUnreadMessageCountUpdatedCallback(callback) {
        this.eventHandler.addEventListener(EventName.zimConversationTotalUnreadMessageCountUpdated, [callback]);
    }
    registerCvListUpdatedCallback(callback) {
        this.eventHandler.addEventListener(EventName.zimKitConversationListUpdate, [
            callback
        ]);
    }
    registerAbnormalCallback(callback) {
        this.eventHandler.addEventListener(EventName.zimKitConversationListQueryAbnormally, [callback]);
    }
    registerCurrentCvUpdatedCallback(callback) {
        this.eventHandler.addEventListener(EventName.zimKitCurrentConversationUpdate, [callback]);
    }
    unInit() {
        this.conversationList.length = 0;
        this.totalUnreadMessageCount = 0;
        this.isAbnormal = false;
        this.activeCvID = '';
        this.loadStatus = 0;
    }
    getConversationByID(conversationID) {
        return this.conversationList.filter(conversation => conversation.conversationID === conversationID)[0];
    }
    insetConversationList(insetConversation) {
        let result = false;
        const isExist = this.conversationList.find(conversation => insetConversation.conversationID === conversation.conversationID);
        if (isExist === undefined) {
            this.conversationList.push(insetConversation);
            result = true;
        }
        return result;
    }
    sortCvListHandle() {
        this.conversationList.sort((a, b) => b.orderKey - a.orderKey);
    }
}
