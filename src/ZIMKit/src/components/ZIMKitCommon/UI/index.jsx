import React from "react";
import ConversationList from "../../ZIMKitConversation/UI";
import MessageView from "../../ZIMKitMessage/UI";
import GroupInfoView from "../../ZIMKitGroup/UI";
import Toast from "./components/Toast";
import BaseDialog from "./components/BaseDialog";
import eventBus, { EmitName } from "../ToolUtil/eventBus";
import './style.css';

class Common extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showGroupInfo: false,
            showToast: false,
            showBaseDialog: false,
            toastData: {
                text: "",
                name: "",
                type: "default"
            },
            dialogData: {
                title: "",
                desc: "",
                cancelText: "",
                confirmText: "",
                hasCloseBtn: false
            }
        };
        this.handleGroupInfoOperation = this.handleGroupInfoOperation.bind(this);
        this.handleToastOperation = this.handleToastOperation.bind(this);
        this.handleDialogOperation = this.handleDialogOperation.bind(this);
    }
    handleGroupInfoOperation(showGroupInfo) {
        this.setState({ 
            showGroupInfo: showGroupInfo === undefined ? !this.state.showGroupInfo : !!showGroupInfo
        });
    }
    handleToastOperation(showToast, toastData) {
        this.setState({ showToast, toastData });
    }
    handleDialogOperation(showBaseDialog, dialogData) {
        this.setState({ showBaseDialog, dialogData });
    }
    componentDidMount() {
        eventBus.on(EmitName.GroupInfoOperation, this.handleGroupInfoOperation);
        eventBus.on(EmitName.ToastOperation, this.handleToastOperation);
        eventBus.on(EmitName.DialogOperation, this.handleDialogOperation);
    }
    componentWillUnmount() {
        eventBus.off(EmitName.GroupInfoOperation, this.handleGroupInfoOperation);
        eventBus.off(EmitName.ToastOperation, this.handleToastOperation);
        eventBus.off(EmitName.DialogOperation, this.handleDialogOperation);
    }
    render() {
        const { showGroupInfo, showToast, showBaseDialog, toastData, dialogData } = this.state;
        return (<div id="zegoim">
            <div className="zego-im-container">
                <div className="top-banner">ZEGO IM</div>
                <div className="box">
                    <ConversationList></ConversationList>
                    <MessageView></MessageView>
                    <GroupInfoView showGroupInfo={ showGroupInfo }></GroupInfoView>
                </div>
                <Toast showToast={ showToast } toastData={ toastData }></Toast>
                <BaseDialog showBaseDialog={ showBaseDialog } dialogData={ dialogData }></BaseDialog>
            </div>
        </div>)
    }
}

export default Common;
