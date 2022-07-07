import { ZIM } from './index.entity';
import { ZIMBase } from './base';
export class ZIMWeb extends ZIMBase {
    static create(appID) {
        if (!ZIMWeb.instance) {
            ZIMWeb.instance = ZIM.create(appID);
        }
        return ZIMWeb.instance;
    }
    static getInstance() {
        return ZIMWeb.instance;
    }
    on(type, listener) {
        return ZIMWeb.instance.on(type, listener);
    }
    off(type) {
        return ZIMWeb.instance.off(type);
    }
    login(userInfo, token) {
        return ZIMWeb.instance.login(userInfo, token);
    }
    logout() {
        return ZIMWeb.instance.logout();
    }
    destroy() {
        return ZIMWeb.instance.destroy();
    }
    renewToken(token) {
        return ZIMWeb.instance.renewToken(token);
    }
    queryConversationList(config) {
        return ZIMWeb.instance.queryConversationList(config);
    }
    createGroup(groupInfo, userIDs, config) {
        return ZIMWeb.instance.createGroup(groupInfo, userIDs, config);
    }
    sendPeerMessage(message, toUserID, config) {
        return ZIMWeb.instance.sendPeerMessage(message, toUserID, config);
    }
    sendGroupMessage(message, toGroupID, config) {
        return ZIMWeb.instance.sendGroupMessage(message, toGroupID, config);
    }
    queryHistoryMessage(conversationID, conversationType, config) {
        return ZIMWeb.instance.queryHistoryMessage(conversationID, conversationType, config);
    }
    deleteConversation(conversationID, conversationType, config) {
        return ZIMWeb.instance.deleteConversation(conversationID, conversationType, config);
    }
    clearConversationUnreadMessageCount(conversationID, conversationType) {
        return ZIMWeb.instance.clearConversationUnreadMessageCount(conversationID, conversationType);
    }
    queryGroupInfo(groupID) {
        return ZIMWeb.instance.queryGroupInfo(groupID);
    }
    queryGroupMemberList(groupID, config) {
        return ZIMWeb.instance.queryGroupMemberList(groupID, config);
    }
    joinGroup(groupID) {
        return ZIMWeb.instance.joinGroup(groupID);
    }
    leaveGroup(groupID) {
        return ZIMWeb.instance.leaveGroup(groupID);
    }
}
