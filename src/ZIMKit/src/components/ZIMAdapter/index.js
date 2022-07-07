import { ZIMPlatform } from './index.entity';
import { ZIMPlatformManage } from './platform';
const platform = process.env.PLATFORM || 'web';
export class ZIMAdapter {
    static initPlatform() {
        if (platform === 'web') {
            ZIMAdapter.zimPlatformManage = new ZIMPlatformManage(ZIMPlatform.Web);
            return import('./web').then(zimAdapter => {
                ZIMAdapter.zimModule = zimAdapter.ZIMWeb;
            });
        }
        else {
            return Promise.resolve();
        }
    }
    static getInstance() {
        return ZIMAdapter.zimModule.getInstance();
    }
    static create(appID) {
        return ZIMAdapter.zimModule.create(appID);
    }
    on(type, listener) {
        return ZIMAdapter.getInstance().on(type, listener);
    }
    off(type) {
        return ZIMAdapter.getInstance().off(type);
    }
    login(userInfo, token) {
        return ZIMAdapter.getInstance().login(userInfo, token);
    }
    logout() {
        return ZIMAdapter.getInstance().logout();
    }
    destroy() {
        return ZIMAdapter.getInstance().destroy();
    }
    renewToken(token) {
        return ZIMAdapter.getInstance().renewToken(token);
    }
    queryConversationList(config) {
        return ZIMAdapter.getInstance().queryConversationList(config);
    }
    createGroup(groupInfo, userIDs, config) {
        return ZIMAdapter.getInstance().createGroup(groupInfo, userIDs, config);
    }
    sendPeerMessage(message, toUserID, config) {
        return ZIMAdapter.getInstance().sendPeerMessage(message, toUserID, config);
    }
    sendGroupMessage(message, toGroupID, config) {
        return ZIMAdapter.getInstance().sendGroupMessage(message, toGroupID, config);
    }
    queryHistoryMessage(conversationID, conversationType, config) {
        return ZIMAdapter.getInstance().queryHistoryMessage(conversationID, conversationType, config);
    }
    deleteConversation(conversationID, conversationType, config) {
        return ZIMAdapter.getInstance().deleteConversation(conversationID, conversationType, config);
    }
    clearConversationUnreadMessageCount(conversationID, conversationType) {
        return ZIMAdapter.getInstance().clearConversationUnreadMessageCount(conversationID, conversationType);
    }
    queryGroupInfo(groupID) {
        return ZIMAdapter.getInstance().queryGroupInfo(groupID);
    }
    queryGroupMemberList(groupID, config) {
        return ZIMAdapter.getInstance().queryGroupMemberList(groupID, config);
    }
    joinGroup(groupID) {
        return ZIMAdapter.getInstance().joinGroup(groupID);
    }
    leaveGroup(groupID) {
        return ZIMAdapter.getInstance().leaveGroup(groupID);
    }
}
