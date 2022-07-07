import { EventName } from '../../ZIMKitCommon/Constant/event';
import ZIMKitEventHandler from '../../ZIMKitCommon/VM/ZIMKitEventHandler';
import ZIMKitManager from '../../ZIMKitCommon/VM/ZIMKitManager';
export default class ZIMKitGroupVM {
    constructor() {
        this.eventHandler = ZIMKitEventHandler.getInstance();
        this.memberList = [];
        if (!ZIMKitGroupVM.instance) {
            ZIMKitGroupVM.instance = this;
            ZIMKitGroupVM.instance.initListenerHandle();
        }
        return ZIMKitGroupVM.instance;
    }
    static getInstance() {
        if (!ZIMKitGroupVM.instance) {
            ZIMKitGroupVM.instance = new ZIMKitGroupVM();
        }
        return ZIMKitGroupVM.instance;
    }
    initListenerHandle() {
        this.eventHandler.addEventListener(EventName.zimKitCreateGroup, [() => { }]);
        this.eventHandler.addEventListener(EventName.zimKitCurrentConversationUpdate, [
            conversation => {
                if (!conversation)
                    return;
                if (conversation.type === 2) {
                    this.currentGroupInfo = {
                        baseInfo: {
                            groupID: conversation.conversationID,
                            groupName: conversation.conversationName
                        }
                    };
                    this.eventHandler.actionListener(EventName.zimKitCurrentGroupInfoUpdated, this.currentGroupInfo);
                    this.queryGroupMemberList(conversation.conversationID);
                }
            }
        ]);
    }
    createGroup(groupID, groupName, userIDList) {
        const currentGroupInfo = { groupID, groupName };
        return ZIMKitManager.getInstance()
            .zim.createGroup(currentGroupInfo, userIDList)
            .then((data) => {
            this.currentGroupInfo = data.groupInfo;
            this.eventHandler.actionListener(EventName.zimKitCurrentGroupInfoUpdated, this.currentGroupInfo);
            return data;
        });
    }
    queryGroupMemberList(groupID) {
        const config = { count: 100, nextFlag: 0 };
        return ZIMKitManager.getInstance()
            .zim.queryGroupMemberList(groupID, config)
            .then(data => {
            this.memberList = data.userList;
        });
    }
    joinGroup(groupID) {
        return ZIMKitManager.getInstance()
            .zim.joinGroup(groupID)
            .then((data) => {
            this.currentGroupInfo = data.groupInfo;
            this.eventHandler.actionListener(EventName.zimKitCurrentGroupInfoUpdated, this.currentGroupInfo);
            return data;
        });
    }
    leaveGroup(groupID) {
        return ZIMKitManager.getInstance().zim.leaveGroup(groupID);
    }
    dismissGroup(groupID) { }
    inviteUsersJoinGroup(userIDList, groupID) { }
    kickGroupMembers(userIDList, groupID) { }
    queryGroupInfo(groupID) {
        return ZIMKitManager.getInstance().zim.queryGroupInfo(groupID);
    }
    unInit() {
        this.currentGroupInfo = null;
        this.memberList.length = 0;
    }
    registerCurrentGroupInfoUpdateCallback(callback) {
        this.eventHandler.addEventListener(EventName.zimKitCurrentGroupInfoUpdated, [callback]);
    }
}
