import React from "react";
import { groupInfoOperation, toastOperation } from "../../ZIMKitCommon/ToolUtil/eventBus";
import ZIMKitGroupVM from "../VM/ZIMKitGroupVM";
import "./style.css";
import ZIMKiti18n from '../../../plugin/i18n';
const i18n = ZIMKiti18n.getInstance().getI18next();

class GroupInfoView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentGroupInfo: null
        };
        this.copy = this.copy.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick(event) {
        if (event.target.className.includes("more-icon")) return;
        let flag = false;
        try {
            event.path.forEach(path => {
                if (path.className && path.className.includes("group-container")) {
                    flag = true;
                    throw new Error("break");
                }
            })
        } catch (error) { }
        if (!flag) {
            groupInfoOperation(false);
        }
    }
    componentDidMount() {
        window.addEventListener("click", this.handleClick);
        ZIMKitGroupVM.getInstance().registerCurrentGroupInfoUpdateCallback(currentGroupInfo => {
            this.setState({ currentGroupInfo });
        });
    }
    componentWillUnmount() {
        window.removeEventListener("click", this.handleClick)
        ZIMKitGroupVM.getInstance().unInit();
    }
    copy() {
        const currentGroupInfo = this.state.currentGroupInfo;
        navigator.clipboard && currentGroupInfo && navigator.clipboard.writeText(currentGroupInfo.baseInfo.groupID).then(() => {
            toastOperation(true, {
                text: i18n.t("group_copy_success"),
                type: "default",
            });
        });
    }
    render() {
        const currentGroupInfo = this.state.currentGroupInfo;
        let groupInfoView = null;
        if (this.props.showGroupInfo) {
            // @ts-ignore
            groupInfoView = <div className="group-container">
                <div className="form-box">
                    <div className="id">
                        <div className="label">{ i18n.t("group_group_id") }</div>
                        <div className="value">{ currentGroupInfo ? currentGroupInfo.baseInfo.groupID : "" }</div>
                    </div>
                    <div className="btn copy-btn" onClick={ this.copy }>{ i18n.t("group_copy") }</div>
                </div>
            </div>
        }
        return groupInfoView;
    }
}

export default GroupInfoView;