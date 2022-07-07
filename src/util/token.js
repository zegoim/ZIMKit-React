import CryptoJS from 'crypto-js';
export function generateToken(userID, seconds, appConfig) {
    if (!userID)
        return '';
    console.log('===appid', appConfig);
    const time = (Date.now() / 1000) | 0;
    const body = {
        app_id: appConfig.appID,
        user_id: userID,
        nonce: (Math.random() * 2147483647) | 0,
        ctime: time,
        expire: time + (seconds || 7200)
    };
    const key = CryptoJS.enc.Utf8.parse(appConfig.serverSecret);
    let iv = Math.random().toString().substring(2, 18);
    if (iv.length < 16)
        iv += iv.substring(0, 16 - iv.length);
    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(body), key, {
        iv: CryptoJS.enc.Utf8.parse(iv)
    }).toString();
    const ciphert = Uint8Array.from(Array.from(atob(ciphertext)).map(val => val.charCodeAt(0)));
    const len_ciphert = ciphert.length;
    const uint8 = new Uint8Array(8 + 2 + 16 + 2 + len_ciphert);
    uint8.set([0, 0, 0, 0]);
    uint8.set(new Uint8Array(Int32Array.from([body.expire]).buffer).reverse(), 4);
    uint8[8] = iv.length >> 8;
    uint8[9] = iv.length - (uint8[8] << 8);
    uint8.set(Uint8Array.from(Array.from(iv).map(val => val.charCodeAt(0))), 10);
    uint8[26] = len_ciphert >> 8;
    uint8[27] = len_ciphert - (uint8[26] << 8);
    uint8.set(ciphert, 28);
    const token = `04${btoa(String.fromCharCode(...Array.from(uint8)))}`;
    console.log('generateToken', iv.length, body, token);
    return token;
}
