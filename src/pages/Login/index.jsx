import React from 'react';
import { connect } from 'react-redux';
import { login, selectIsLoggedIn } from '../../store/authSlice';
import { addCacheUserToList, getUserName, setCacheUserInfo } from '../../util';
import { generateToken } from '../../util/token';
import appConfig from '../../config';
import ZIMKitManager from '../../ZIMKit/src/components/ZIMKitCommon/VM/ZIMKitManager';
import './style.css';
import { Navigate } from 'react-router-dom';
import ZIMKiti18n from '../../ZIMKit/src/plugin/i18n';
const i18n = ZIMKiti18n.getInstance().getI18next();

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { userID: '', userName: '', verify: false };
    this.getUserName = this.getUserName.bind(this);
    this.loginFun = this.loginFun.bind(this);
  }
  componentDidMount() {
    const result = getUserName('');
    this.setState({ ...result });
    console.log('i18n', i18n);
  }
  getUserName(event) {
    const userID = event.target.value;
    const result = getUserName(userID);
    this.setState({ userID, ...result });
  }
  loginFun() {
    const token = generateToken(this.state.userID, 0, appConfig);
    const userInfo = {
      userID: this.state.userID,
      userName: this.state.userName
    };
    ZIMKitManager.getInstance()
      .loginWithUserInfo(userInfo, token)
      .then(() => {
        setCacheUserInfo(userInfo);
        addCacheUserToList(userInfo);
        this.props.login();
      })
      .catch((error) => {
        this.setState({ verify: false });
      });
  }
  render() {
    return (
      <div id="login">
        {this.props.isLoggedIn && <Navigate to="/main" replace={true} />}
        <div className="login-box">
          <div className="welcome-box">
            <div className="welcome-text">{i18n.t('demo_welcome')}</div>
          </div>
          <div className={`form ${i18n.language === 'en' ? 'en-form' : null}`}>
            <div className="id">
              <div className="label">{i18n.t('demo_user_id_login')}</div>
              <input
                className={i18n.language === 'en' ? 'en-input' : null}
                placeholder={i18n.t('demo_input_placeholder_w')}
                onInput={this.getUserName}
              />
              <div
                className="login-err-tip"
                style={{
                  display:
                    !this.state.verify && this.state.userID ? 'block' : 'none'
                }}>
                {i18n.t('demo_input_user_id_error_tips')}
              </div>
            </div>
            <div className="name">
              <div className="label">{i18n.t('demo_user_name_w')}</div>
              <div id="userName">{this.state.userName}</div>
            </div>
            <button
              className="login-btn"
              onClick={this.loginFun}
              disabled={!this.state.verify}>
              {i18n.t('demo_login')}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    login: content => dispatch(login(content))
  };
};

export default connect(selectIsLoggedIn, mapDispatchToProps)(LoginPage);
