import { EventEmitter } from 'events';
const eventEmit = new EventEmitter();
export var EmitName;
(function (EmitName) {
    EmitName["ToastOperation"] = "toastOperation";
    EmitName["DialogOperation"] = "dialogOperation";
    EmitName["GroupInfoOperation"] = "groupInfoOperation";
})(EmitName || (EmitName = {}));
export const groupInfoOperation = (showGroupInfo) => {
    eventEmit.emit(EmitName.GroupInfoOperation, showGroupInfo);
};
export const toastOperation = (showToast, toastData) => {
    eventEmit.emit(EmitName.ToastOperation, showToast, toastData);
};
export const dialogOperation = (showBaseDialog, dialogData) => {
    eventEmit.emit(EmitName.DialogOperation, showBaseDialog, dialogData);
};
export default eventEmit;
