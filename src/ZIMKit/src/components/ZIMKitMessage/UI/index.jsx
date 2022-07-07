import React from "react";
import ZIMKitMessageVM from "../VM/ZIMKitMessageVM";
import { dateFormat } from "../../ZIMKitCommon/ToolUtil/dateFormat";
import ZIMKitGroupVM from "../../ZIMKitGroup/VM/ZIMKitGroupVM";
import "../../ZIMKitCommon/UI/common.css"
import "./style.css"
import { groupInfoOperation } from "../../ZIMKitCommon/ToolUtil/eventBus";
import ZIMKiti18n from '../../../plugin/i18n';
import ZIMKitManager from "../../ZIMKitCommon/VM/ZIMKitManager";
const i18n = ZIMKiti18n.getInstance().getI18next();

class MessageView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentChat: null,
            currentMessageList: [],
            message: "",
            oldScrollHeight: 0,
            newScrollHeight: 0,
            userInfo: {}
        }
        this.listScroll = this.listScroll.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.dateFormat = this.dateFormat.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.getGroupUserName = this.getGroupUserName.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
        this.triggerGroupInfo = this.triggerGroupInfo.bind(this);
    }
    componentDidMount() {
        ZIMKitMessageVM.getInstance().registerLoginUserUpdatedCallback(userInfo => {
            this.setState({ userInfo });
        })
        ZIMKitMessageVM.getInstance().registerCurrentChatUpdatedCallback(currentChat => {
            this.setState({ currentChat, message: "" }, () => {
                // Auto focus
                const messageInput = document.querySelector('.text-area');
                // @ts-ignore
                messageInput && (messageInput.focus());
            });
        });
        ZIMKitMessageVM.getInstance().registerMessageListUpdatedCallback(currentMessageList => {
            this.setState({ currentMessageList }, () => {
                this.scrollToBottom();
            });
        });
    }
    componentWillUnmount() {
        ZIMKitMessageVM.getInstance().unInit();
    }
    scrollToBottom() {
        const msgElement = document.querySelector(".message-content");
        if (msgElement) {
            const scrollTop = Number(msgElement.scrollHeight) - Number(msgElement.clientHeight);
            msgElement.scrollTop = scrollTop;
        }
    }
    listScroll() {
        const msgElement = document.querySelector(".message-content");
        if (msgElement) {
            const scrollTop = Math.round(msgElement.scrollTop);
            const scrollHeight = msgElement.scrollHeight;
            const { currentMessageList, currentChat } = this.state;
            if (scrollTop === 0) {
                if (ZIMKitMessageVM.getInstance().messageCount <= currentMessageList.length) {
                    ZIMKitMessageVM.getInstance().messageCount = currentMessageList.length + 30;
                    ZIMKitMessageVM.getInstance().queryHistoryMessage(currentChat.conversationID, currentChat.type).then(() => {
                        this.setState({
                            oldScrollHeight: scrollHeight,
                        }, () => {
                            this.setState({
                                newScrollHeight: msgElement.scrollHeight,
                            }, () => {
                                msgElement.scrollTop = this.state.newScrollHeight - this.state.oldScrollHeight;
                            });
                        });
                    })
                }
            }
        }
    }
    sendMessage() {
        const messageObj = {
            type: 1,
            message: this.state.message,
        };
        if (this.state.currentChat.type === 2) {
            ZIMKitMessageVM.getInstance().sendGroupMessage(messageObj);
        } else {
            ZIMKitMessageVM.getInstance().sendPeerMessage(messageObj);
        }
        this.setState({ message: "" });
    }
    getGroupUserName(userID) {
        const memberList = ZIMKitGroupVM.getInstance().memberList;
        let groupIDUserName = userID;
        if (memberList.length) {
            const member = memberList.filter((item) => item.userID === userID)[0];
            groupIDUserName =  member ? member.userName : userID;
        }
        return groupIDUserName;
    }
    dateFormat(currentMessage, currentIndex) {
        if (currentIndex === 0) {
            return dateFormat(currentMessage.timestamp, true);
        } else {
            const previousMessage = this.state.currentMessageList[currentIndex - 1];
            if (previousMessage && currentMessage.timestamp - previousMessage.timestamp > 300000) {
                return dateFormat(currentMessage.timestamp, true);
            }
        }
    }
    handleInputChange(event) {
        this.setState({
            message: event.target.value
        });
    }
    triggerGroupInfo() {
        groupInfoOperation(true);
    }
    render() {
        const { currentChat, currentMessageList } = this.state;
        const { userID, userName } = ZIMKitManager.getInstance().userInfo;
        let chatContentView = null;
        if (!currentChat || !currentChat.conversationID) {
            chatContentView = (<div className="default-content">
                <div className="img"></div>
                <div className="text">{ i18n.t("message_empty_w") }</div>
            </div>);
        } else {
            const { conversationName, conversationID, type } = currentChat;
            chatContentView = (
                <React.Fragment>
                    <div className="header">
                        <div className="title">{ conversationName || conversationID }</div>
                        { type === 2 ? <div className="more-icon" onClick={ this.triggerGroupInfo }></div> : null }
                    </div>
                    <div className="message-content" onScroll={ this.listScroll }>
                        {
                            currentMessageList.map((item, index) => {
                                const time = this.dateFormat(item, index);
                                const isReceive = item.conversationType === 2 ? item.senderUserID !== userID : item.senderUserID !== userID;
                                const isError = item.type === 99;
                                const groupUserName = this.getGroupUserName(item.senderUserID);
                                return <div className="message-item" key={ item.messageID + index }>
                                    {
                                        time ? <div className="time-box">{ time }</div> : null
                                    }
                                    {
                                        isReceive ? <div className="left-msg">
                                            <div className="head-portrait">
                                                { item.conversationType === 2 ? groupUserName.substr(0, 1).toLowerCase() : (conversationName ? conversationName.substr(0, 1).toLowerCase() : "") }
                                            </div>
                                            <div className="message-box">
                                                { item.conversationType === 2 ? <div className="send-name">{ groupUserName }</div> : null }
                                                <div className="msg-text">{ item.message }</div>
                                            </div>
                                        </div> : null
                                    }
                                    {
                                        isError ? <div className="center-msg">{ item.message }</div> : null
                                    }
                                    {
                                        !isReceive && !isError ? <div className="right-msg">
                                            { item.type !== 99 && item.sentStatus === 2 ? <div className="err-icon"></div> : null }
                                            <div className="message-box">
                                                {/* { item.conversationType === 2 ? <div className="send-name">{ userName }</div> : null } */}
                                                <div className="msg-text">{ item.message }</div>
                                            </div>
                                            <div className="head-portrait">{ userName.substr(0, 1).toLowerCase() }</div>
                                        </div> : null
                                    }
                                </div>
                            })
                        }
                    </div>
                    <div className="send-box">
                        <div className="tool-box"></div>
                        <textarea className="text-area" value={this.state.message} onInput={ this.handleInputChange }></textarea>
                        <button className="btn send-button" onClick={ this.sendMessage } disabled={ !this.state.message }>{ i18n.t("message_send_w") }</button>
                    </div>
                </React.Fragment>
            );
        }
        return (<div className="chat">{ chatContentView }</div>);
    }
}

export default MessageView;