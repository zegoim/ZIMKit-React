import { ZIMAdapter } from '../../ZIMAdapter';
import ZIMKitEventHandler from './ZIMKitEventHandler';
import { EventName } from '../Constant/event';
import ZIMKiti18n from '../../../plugin/i18n';
ZIMKiti18n.getInstance().init();
export default class ZIMKitManager {
    constructor() {
        this.eventHandler = ZIMKitEventHandler.getInstance();
        this.userInfo = {};
        this.isInit = false;
        this.isLoggedIn = false;
        if (!ZIMKitManager.instance) {
            ZIMKitManager.instance = this;
        }
        return ZIMKitManager.instance;
    }
    static getInstance() {
        if (!ZIMKitManager.instance) {
            ZIMKitManager.instance = new ZIMKitManager();
        }
        return ZIMKitManager.instance;
    }
    createZIM(appConfig) {
        this.appConfig = appConfig;
        return ZIMAdapter.initPlatform().then(() => {
            this.zim = ZIMAdapter.create(appConfig.appID);
            this.isInit = true;
            this.onEvent();
            window.manager = this;
        });
    }
    loginWithUserInfo(userInfo, token) {
        this.userInfo = userInfo;
        return this.zim.login(userInfo, token).then(() => {
            this.token = token;
            this.isLoggedIn = true;
            this.eventHandler.actionListener(EventName.zimKitLoginUserUpdate, userInfo);
        });
    }
    logout() {
        this.isLoggedIn = false;
        this.token = '';
        return this.zim.logout();
    }
    destroy() {
        this.offEvent();
        this.zim.destroy();
        this.isInit = false;
    }
    registerConnectionStateChangedCallback(callback) {
        this.eventHandler.addEventListener(EventName.zimConnectionStateChanged, [
            callback
        ]);
    }
    onEvent() {
        this.zim.on(EventName.zimError, (zim, errorInfo) => {
            this.eventHandler.actionListener(EventName.zimError, errorInfo);
        });
        this.zim.on(EventName.zimConnectionStateChanged, (zim, data) => {
            if (data.state === 0 && data.event === 3) {
                this.zim.login(this.userInfo, this.token);
            }
            this.eventHandler.actionListener(EventName.zimConnectionStateChanged, data);
        });
        this.zim.on(EventName.zimReceivePeerMessage, (zim, data) => {
            this.eventHandler.actionListener(EventName.zimReceivePeerMessage, data);
        });
        this.zim.on(EventName.zimReceiveGroupMessage, (zim, data) => {
            this.eventHandler.actionListener(EventName.zimReceiveGroupMessage, data);
        });
        this.zim.on(EventName.zimConversationTotalUnreadMessageCountUpdated, (zim, data) => {
            this.eventHandler.actionListener(EventName.zimConversationTotalUnreadMessageCountUpdated, data);
        });
        this.zim.on(EventName.zimConversationChanged, (zim, data) => {
            this.eventHandler.actionListener(EventName.zimConversationChanged, data);
        });
    }
    offEvent() {
        this.zim.off(EventName.zimError);
        this.zim.off(EventName.zimConversationChanged);
        this.zim.off(EventName.zimTokenWillExpire);
        this.zim.off(EventName.zimReceivePeerMessage);
        this.zim.off(EventName.zimReceiveGroupMessage);
        this.zim.off(EventName.zimConversationTotalUnreadMessageCountUpdated);
    }
}
