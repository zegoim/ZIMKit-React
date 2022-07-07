import React from 'react';
import Common  from "../../ZIMKit/src/components/ZIMKitCommon/UI";
import { connect } from "react-redux";
import { logout, selectIsLoggedIn } from "../../store/authSlice";
import { Navigate } from 'react-router-dom';
import ZIMKitManager from '../../ZIMKit/src/components/ZIMKitCommon/VM/ZIMKitManager';
import { clearCacheUserInfo } from '../../util';

class MainPage extends React.Component {
    componentDidMount(){
        ZIMKitManager.getInstance().registerConnectionStateChangedCallback(data => {
            if (data.state === 0 && (data.event === 0 || data.event === 4)) {
                this.props.logout();
                clearCacheUserInfo();
            }
        });
    }
    render() {
        return (<div id="main">
            {
                !this.props.isLoggedIn && (<Navigate to='/login' replace={ true } />)
            }
            <Common></Common> 
        </div>);
    }
}

const mapDispatchToProps = dispatch => {
    return {
        logout: content => dispatch(logout(content))
    };
};
  
export default connect(selectIsLoggedIn, mapDispatchToProps)(MainPage);