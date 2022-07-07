import React from "react";
import './../../common.css'
import './style.css'
import ZIMKiti18n from '../../../../../plugin/i18n';
const i18n = ZIMKiti18n.getInstance().getI18next();

class RightClickDialog extends React.Component {
    constructor (props) {
        super(props);
        this.deleteConversation = this.deleteConversation.bind(this);
        this.closeConversation = this.closeConversation.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick(event) {
        let flag = false;
        try {
            event.path.forEach(path => {
                if (path.className && path.className.includes("right-click-box")) {
                    flag = true;
                    throw new Error("break");
                }
            })
        } catch (error) { }
        if (!flag) {
            this.closeConversation();
        }
    }
    componentDidMount() {
        window.addEventListener("click", this.handleClick);
    }
    componentWillUnmount() {
        window.removeEventListener("click", this.handleClick)
    }
    deleteConversation() {
        this.props.onDeleteConversation();
    }
    closeConversation() {
        this.props.onCloseConversation();
    }
    render() {
        return (<div className="right-click-box" style={{ top: `${this.props.y}px`, left: `${this.props.x}px` }}>
            <div className="item" onClick={ this.deleteConversation }>{ i18n.t("conversation_close_chat_w") }</div>
        </div>)
    }
}

export default RightClickDialog;