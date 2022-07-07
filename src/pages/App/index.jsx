import React from "react";
import { Routes, Route } from "react-router-dom";
import { connect } from "react-redux";
import LoginPage from "../Login/index";
import MainPage from "../Main/index";
import { initIMKitSDK, login, selectIsLoggedIn } from "../../store/authSlice";
import appConfig from "../../config";
import ZIMKitManager from "../../ZIMKit/src/components/ZIMKitCommon/VM/ZIMKitManager";
import { getCacheUserInfo } from '../../util/index';
import { generateToken } from '../../util/token';
class App extends React.Component {
    cacheUserInfo = getCacheUserInfo()
    async componentDidMount() {
        // Init IMKitSDK
        const zimKit = new ZIMKitManager();
        await zimKit.createZIM(appConfig);
        this.props.initIMKitSDK(true);
        if (this.cacheUserInfo) {
            // Auto login
            const token = generateToken(this.cacheUserInfo.userID, 0, appConfig);
            await ZIMKitManager.getInstance().loginWithUserInfo(this.cacheUserInfo,token);
            this.props.login();
        }
    }
    render() {
        return (
            <Routes>
                <Route path="/" element={ <MainPage /> } />
                <Route path="/main" element={ <MainPage /> } />
                <Route path="/login" element={ <LoginPage /> } />
            </Routes>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        initIMKitSDK: content => dispatch(initIMKitSDK(content)),
        login: content => dispatch(login(content))
    };
};

export default connect(selectIsLoggedIn, mapDispatchToProps)(App);
