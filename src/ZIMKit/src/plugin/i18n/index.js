import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh from '../../locales/zh';
import en from '../../locales/en';
class ZIMKiti18n {
    constructor() {
        this.localesData = {
            en: {},
            zh: {}
        };
        this.i18next = i18n.use(initReactI18next);
        if (!ZIMKiti18n.instance) {
            const localesData = { en, zh };
            this.localesData = localesData;
            ZIMKiti18n.instance = this;
        }
        return ZIMKiti18n.instance;
    }
    static getInstance() {
        if (!ZIMKiti18n.instance) {
            ZIMKiti18n.instance = new ZIMKiti18n();
        }
        return ZIMKiti18n.instance;
    }
    static destroy() {
        ZIMKiti18n.instance.localesData = { en: {}, cn: {} };
        ZIMKiti18n.instance = null;
    }
    init() {
        const options = {
            resources: {
                zh: { translation: this.localesData.zh },
                en: { translation: this.localesData.en }
            },
            fallbackLng: navigator.language,
            detection: {
                caches: ['localStorage', 'sessionStorage', 'cookie']
            }
        };
        return this.i18next.init(options);
    }
    provideMessage(localesData) {
        this.localesData.en = Object.assign(Object.assign({}, this.localesData.en), localesData.en);
        this.localesData.zh = Object.assign(Object.assign({}, this.localesData.zh), localesData.zh);
        return this.localesData;
    }
    getLocalesData() {
        return this.localesData;
    }
    getI18next() {
        return this.i18next;
    }
}
export default ZIMKiti18n;
