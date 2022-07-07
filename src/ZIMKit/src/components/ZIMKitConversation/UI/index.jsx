import React from 'react';
import ZIMKitManager from '../../ZIMKitCommon/VM/ZIMKitManager';
import ZIMKitConversationVM from '../VM/ZIMKitConversation';
import ZIMKitGroupVM from '../../ZIMKitGroup/VM/ZIMKitGroupVM';
import CreateChatDialog from '../../ZIMKitCommon/UI/components/CreateChatDialog';
import RightClickDialog from '../../ZIMKitCommon/UI/components/RightClickDialog';
import './style.css';
import { dateFormat } from '../../ZIMKitCommon/ToolUtil/dateFormat';
import {
  dialogOperation,
  toastOperation
} from '../../ZIMKitCommon/ToolUtil/eventBus';
import ZIMKiti18n from '../../../plugin/i18n';
const i18n = ZIMKiti18n.getInstance().getI18next();

class ConversationItem extends React.Component {
  constructor(props) {
    super(props);
    this.switchConversation = this.switchConversation.bind(this);
    this.operationConversation = this.operationConversation.bind(this);
  }
  switchConversation() {
    const { conversation } = this.props;
    ZIMKitConversationVM.getInstance().setCurrentConversation(
      conversation.conversationID
    );
    ZIMKitConversationVM.getInstance().clearConversationUnreadMessageCount(
      conversation.conversationID,
      conversation.type
    );
  }
  operationConversation(event) {
    event.preventDefault();

    const con = document.querySelector(
      '.zego-im-container .box'
    );
    this.props.onRightClick({
      showRightClickDialog: true,
      x: event.clientX - con.offsetLeft,
      y: event.clientY - con.offsetTop,
      conversationItem: this.props.conversation
    });
  }
  nameFormat(item) {
    return (item.conversationName || item.conversationID)
      .slice(0, 1)
      .toLowerCase();
  }
  render() {
    let unreadCountView = null;
    const conversation = this.props.conversation;
    const currentConversation = this.props.currentConversation;
    if (conversation.unreadMessageCount) {
      unreadCountView = (
        <div className="unread-count">
          {conversation.unreadMessageCount > 99
            ? '99+'
            : conversation.unreadMessageCount}
        </div>
      );
    }
    return (
      <div
        className={
          'conversation-item' +
          (currentConversation &&
          conversation.conversationID === currentConversation.conversationID
            ? ' actived'
            : '')
        }
        onClick={this.switchConversation}
        onContextMenu={this.operationConversation}>
        <div className="head-portrait">
          {conversation.type === 0 ? this.nameFormat(conversation) : 'G'}
          {unreadCountView}
        </div>
        <div className="conversation-info">
          <div className="info-top">
            <div className="item-name">
              {conversation.conversationName || conversation.conversationID}
            </div>
            {conversation.lastMessage ? (
              <div className="item-date">
                {dateFormat(conversation.lastMessage.timestamp, false)}
              </div>
            ) : null}
          </div>
          {conversation.lastMessage ? (
            <div className="item-message">
              {conversation.lastMessage.sentStatus === 2 ? (
                <div className="err-icon"></div>
              ) : null}
              <div className="message-text">
                {conversation.lastMessage.message}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

class ConversationList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAbnormal: false,
      totalUnreadMessageCount: 0,
      conversationList: [],
      showCreateChatDialog: false,
      showRightClickDialog: false,
      x: 0,
      y: 0,
      conversationItem: null, // Right click conversation
      currentConversation: null
    };
    this.logout = this.logout.bind(this);
    this.listScroll = this.listScroll.bind(this);
    this.triggerDialog = this.triggerDialog.bind(this);
    this.handleRightClick = this.handleRightClick.bind(this);
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
    this.handleCreatePeerChat = this.handleCreatePeerChat.bind(this);
    this.handleCreateGroupChat = this.handleCreateGroupChat.bind(this);
    this.handleJoinGroup = this.handleJoinGroup.bind(this);
    this.handleDeleteConversation = this.handleDeleteConversation.bind(this);
    this.handleCloseConversation = this.handleCloseConversation.bind(this);
  }
  componentDidMount() {
    if (ZIMKitManager.getInstance().isLoggedIn) {
      ZIMKitConversationVM.getInstance().loadConversationList();
    }
    ZIMKitConversationVM.getInstance().registerIsLoggedInCallback(
      () => {
        ZIMKitConversationVM.getInstance().loadConversationList();
      }
    );
    ZIMKitConversationVM.getInstance().registerCvTotalUnreadMessageCountUpdatedCallback(
      data => {
        this.setState({
          totalUnreadMessageCount: data.totalUnreadMessageCount
        });
      }
    );
    ZIMKitConversationVM.getInstance().registerCvListUpdatedCallback(
      conversationList => {
        this.setState({ conversationList });
      }
    );
    ZIMKitConversationVM.getInstance().registerCurrentCvUpdatedCallback(
      currentConversation => {
        this.setState({ currentConversation });
      }
    );
    ZIMKitConversationVM.getInstance().registerAbnormalCallback(isAbnormal => {
      this.setState({ isAbnormal });
    });
  }
  componentWillUnmount() {
    ZIMKitConversationVM.getInstance().unInit();
  }
  listScroll() {
    const msgElement = document.querySelector(
      '.conversation-content'
    );
    const scrollTop = Math.round(msgElement.scrollTop);
    const scrollHeight = msgElement.scrollHeight;
    const clientHeight = msgElement.clientHeight;
    if (scrollTop >= scrollHeight - clientHeight) {
      ZIMKitConversationVM.getInstance().loadNextPage();
    }
    if (scrollTop === 0) {
      // todo reload
    }
  }
  triggerDialog(show) {
    this.setState({ showCreateChatDialog: show });
  }
  handleRightClick(data) {
    this.setState(data);
  }
  handleCloseDialog() {
    this.triggerDialog(false);
  }
  handleCreatePeerChat(toUserID) {
    const conversationItem = this.state.conversationList.filter(
      item => item.conversationID === toUserID
    )[0];
    if (conversationItem) {
      ZIMKitConversationVM.getInstance().setCurrentConversation(
        conversationItem.conversationID
      );
    } else {
      ZIMKitConversationVM.getInstance().setTempConversation({
        conversationID: toUserID,
        conversationName: toUserID,
        type: 0
      });
    }
    this.triggerDialog(false);
  }
  handleCreateGroupChat(groupName, userIDList) {
    const userIDListArr = userIDList.split(';').filter(userID => userID);
    ZIMKitGroupVM.getInstance()
      .createGroup('', groupName, userIDListArr)
      .then((data) => {
        const { groupInfo, errorUserList } = data;
        const { baseInfo } = groupInfo;
        if (errorUserList.length) {
          const errorUserIDList = errorUserList
            .map(item => item.userID)
            .join(' ');
          dialogOperation(true, {
            desc: `${i18n
              .t('message_user_not_exit_please_again')
              .replace('%s', errorUserIDList)}`,
            // desc: `${i18n.t("message_user_not_exit_please_again_w_1")} ${errorUserIDList} ${i18n.t("message_user_not_exit_please_again_w_2")}`,
            cancelText: i18n.t('common_return'),
            hasCloseBtn: false
          });
          return;
        } else {
          this.setState({ showCreateChatDialog: false });
          ZIMKitConversationVM.getInstance().setTempConversation({
            conversationID: baseInfo.groupID,
            conversationName: baseInfo.groupName,
            type: 2
          });
        }
      })
      .catch(() => {
        this.setState({ showCreateChatDialog: false });
      });
  }
  handleJoinGroup(groupID) {
    ZIMKitGroupVM.getInstance()
      .joinGroup(groupID)
      .then(data => {
        const { groupInfo } = data;
        const { baseInfo } = groupInfo;
        this.setState({ showCreateChatDialog: false });
        ZIMKitConversationVM.getInstance().setTempConversation({
          conversationID: baseInfo.groupID,
          conversationName: baseInfo.groupName,
          type: 2
        });
      })
      .catch((error) => {
        switch (error.code) {
          case 6000523:
            dialogOperation(true, {
              desc: `${i18n
                .t('group_group_id_not_exit')
                .replace('%s', groupID)}`,
              cancelText: i18n.t('common_return'),
              hasCloseBtn: false
            });
            break;
          default:
            toastOperation(true, {
              text: error.message,
              type: 'default'
            });
            break;
        }
      });
  }
  handleDeleteConversation() {
    // Delete conversation
    const { conversationID, type } = this.state.conversationItem;
    ZIMKitConversationVM.getInstance()
      .deleteConversation(conversationID, type)
      .then(() => {})
      .finally(() => {
        // Close right click dialog
        this.setState({
          showRightClickDialog: false
        });
      });
  }
  handleCloseConversation() {
    this.setState({
      showRightClickDialog: false
    });
  }
  logout() {
    ZIMKitManager.getInstance().logout();
  }
  render() {
    let totalView = null,
      createChatDialogView = null,
      rightClickDialogView = null;
    let conversationListView = null;
    if (this.state.totalUnreadMessageCount) {
      totalView = (
        <div className="total">
          {this.state.totalUnreadMessageCount > 99
            ? '99+'
            : this.state.totalUnreadMessageCount}
        </div>
      );
    }
    if (this.state.showCreateChatDialog) {
      createChatDialogView = (
        <CreateChatDialog
          onCloseDialog={this.handleCloseDialog}
          onCreatePeerChat={this.handleCreatePeerChat}
          onCreateGroupChat={this.handleCreateGroupChat}
          onJoinGroup={this.handleJoinGroup}
        />
      );
    }
    if (this.state.showRightClickDialog) {
      rightClickDialogView = (
        <RightClickDialog
          x={this.state.x}
          y={this.state.y}
          onDeleteConversation={this.handleDeleteConversation}
          onCloseConversation={this.handleCloseConversation}
        />
      );
    }
    if (this.state.conversationList && this.state.conversationList.length) {
      conversationListView = this.state.conversationList.map(
        (element, index) => (
          <ConversationItem
            key={element.conversationID + index}
            conversation={element}
            currentConversation={this.state.currentConversation}
            onRightClick={this.handleRightClick}
          />
        )
      );
    }
    return (
      <div className="conversation">
        <div className="left-banner">
          <div className="top">
            <div className="item">
              <div className="icon message-icon"></div>
              <div className="text">
                {i18n.t('conversation_message_total_count')}
              </div>
              {totalView}
            </div>
            <div className="item" onClick={this.triggerDialog.bind(this, true)}>
              <div className="icon create-chat-icon"></div>
              <div className="text create-chat-text">
                {i18n.t('conversation_start_chat_w')}
              </div>
            </div>
          </div>
          <div className="item" onClick={this.logout}>
            <div className="icon exit-icon"></div>
            <div className="text exit-text">{i18n.t('common_logout')}</div>
          </div>
        </div>
        {!this.state.isAbnormal ? (
          this.state.conversationList.length ? (
            <div className="conversation-content" onScroll={this.listScroll}>
              {conversationListView}
            </div>
          ) : (
            <div className="default-content">
              <div className="text">{i18n.t('conversation_empty')}</div>
            </div>
          )
        ) : (
          <div className="abnormal-content">
            <div
              className="btn reload-btn"
              onClick={ZIMKitConversationVM.getInstance().loadConversationList.bind(
                ZIMKitConversationVM.getInstance()
              )}>
              {i18n.t('conversation_reload')}
            </div>
          </div>
        )}
        {createChatDialogView}
        {rightClickDialogView}
      </div>
    );
  }
}

export default ConversationList;
