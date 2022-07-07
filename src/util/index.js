import nameArr from './name';
export const getCacheUserInfo = () => {
    return localStorage.userInfo
        ? JSON.parse(localStorage.userInfo)
        : null;
};
export const setCacheUserInfo = (userInfo) => {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
};
export const clearCacheUserInfo = () => {
    localStorage.removeItem('userInfo');
};
export const getCacheUserList = () => {
    return localStorage.userList
        ? JSON.parse(localStorage.userList)
        : null;
};
export const addCacheUserToList = (userInfo) => {
    let userList = localStorage.userList
        ? JSON.parse(localStorage.userList)
        : [];
    const isExist = userList.find(item => userInfo.userID === item.userID);
    !isExist && userList.push(userInfo);
    localStorage.setItem('userList', JSON.stringify(userList));
};
export const deleteCacheUserToList = () => { };
export const clearCacheUserList = () => { };
export const createRandomName = () => {
    return nameArr[Math.floor(Math.random() * nameArr.length)];
};
export const getUserName = (value) => {
    const cacheUserList = getCacheUserList();
    const randomName = createRandomName();
    const result = {
        userName: '',
        verify: true
    };
    if (value.length >= 6 && value.length <= 12) {
        if (cacheUserList && cacheUserList.some(item => item.userID === value)) {
            result.userName = cacheUserList.filter(item => item.userID === value)[0].userName;
        }
        else {
            result.userName = randomName;
        }
    }
    else {
        result.verify = false;
        result.userName = randomName;
    }
    return result;
};
