import React from "react";
import {toast} from "react-toastify";
import NotificationIcon from './resources/icons/Notification.svg';
import WarningIcon from './resources/icons/Warning.svg';
import ErrorIcon from './resources/icons/Error.svg';
import HaltedIcon from './resources/icons/Halted.svg';

class ToastHelper {
    public static info(from: string | undefined, message: string) {
        console.info(from + ": " + message);
        toast.info(ToastHelper.createToastMessage(from, message), {
            icon: <img className="toast-icon" src={NotificationIcon}/>
        });
    }

    public static warning(from: string | undefined, message: string) {
        console.warn(from + ": " + message);
        toast.warning(ToastHelper.createToastMessage(from, message), {
            icon: <img className="toast-icon" src={WarningIcon}/>
        });
    }

    public static error(from: string |undefined, message: string) {
        console.error(from + ": " + message);
        toast.error(ToastHelper.createToastMessage(from, message), {
            icon: <img className="toast-icon" src={ErrorIcon}/>
        });
    }

    public static halted(from: string |undefined, message: string) {
        console.error(from + ": " + message);
        toast.error(ToastHelper.createToastMessage(from, message), {
            icon: <img className="toast-icon" src={HaltedIcon}/>
        });
    }

    private static createToastMessage(from: string | undefined, message: string) {
        // @ts-ignore
        return ({ closeToast, toastProps }) => {
            return (
                <div>
                    {from !== undefined && <div className="toast-from">{from}</div>}
                    <div className="toast-message">{message}</div>
                </div>
            )
        };
    }
}

export default ToastHelper;