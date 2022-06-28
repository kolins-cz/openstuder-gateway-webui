import React from "react";
import SIGatewayComponent from "./SIGatewayComponent";
import {SIDeviceMessage, SIGatewayClient, SIStatus} from "@openstuder/openstuder";
import NotificationIcon from './resources/icons/Notification.svg';
import WarningIcon from './resources/icons/Warning.svg';
import ErrorIcon from './resources/icons/Error.svg';
import HaltedIcon from './resources/icons/Halted.svg';
import {DeviceAccessDescription} from "./Description";
import StateStorage from "./StateStorage";

interface MessagesProperties {
    client: SIGatewayClient,
    deviceAccess?: DeviceAccessDescription,
    stateStorage: StateStorage
}

type Message = SIDeviceMessage & { highlighted: boolean }

enum MessagesTimeInterval  {
    None,
    Day,
    Week,
    Month,
    Year,
    All
}

class MessagesState {
    interval = MessagesTimeInterval.None;
    messages = Array<Message>();
}

class Messages extends SIGatewayComponent<MessagesProperties, MessagesState> {

    private lastLoadedMessageTimestamp?: Date = undefined;

    public constructor(props: MessagesProperties) {
        super(props);
        this.state = new MessagesState();
    }

    public componentDidMount() {
        const state = this.props.stateStorage.getState<MessagesState>("messages", () => {
            return new MessagesState();
        });
        this.setState(state);
        if (state.interval === MessagesTimeInterval.None) {
            this.loadMore();
        }
    }

    componentWillUnmount() {
        this.props.stateStorage.saveState("messages",  this.state);
    }

    public render() {
        let moreText = "load more...";
        switch (this.state.interval) {
            case MessagesTimeInterval.None:
                moreText = "load messages for last 24 hours...";
                break;

            case MessagesTimeInterval.Day:
                moreText = "load messages for last 7 days..."
                break;

            case MessagesTimeInterval.Week:
                moreText = "load messages for last 31 days..."
                break;

            case MessagesTimeInterval.Month:
                moreText = "load messages for last 365 days..."
                break;
            case MessagesTimeInterval.Year:
                moreText = "load all messages..."
                break;

            case MessagesTimeInterval.All:
                moreText = "";
                break;
        }

        return (
            <div className="messages">
                <div className="message-list">
                <table>
                    <thead>
                    <tr>
                        <th/>
                        <th>Date and time</th>
                        <th>Device ID</th>
                        <th>Message</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.messages.map((message) => (
                        <tr className={message.highlighted ? "highlighted" : ""} key={message.timestamp.getTime().toString() + '-' + message.messageId}>
                            <td className="type">
                                <img alt="" src={message.message.startsWith('Halted:') ? HaltedIcon : message.message.startsWith("Error:") ? ErrorIcon : message.message.startsWith("Warning:") ? WarningIcon : NotificationIcon}/>
                            </td>
                            <td className="timestamp">{message.timestamp.toLocaleString()}</td>
                            <td className="id">{message.accessId}.{message.deviceId}</td>
                            <td className="content">{message.message} <span className="id">({message.messageId})</span></td>
                        </tr>
                    ))}
                    <tr className="more">
                        <td colSpan={4}>
                            {this.state.interval !== MessagesTimeInterval.All && <button className="more" onClick={this.loadMore}>
                                {moreText}
                            </button>}
                        </td>
                    </tr>
                    </tbody>
                </table>
                </div>
            </div>
        )
    }

    private addMessages(live:  boolean, ...messages: Array<SIDeviceMessage>) {
        let allMessages = this.state.messages;
        allMessages.push(...messages.map((message) => {
            let newMessage = message as Message;
            newMessage.highlighted = live;
            return newMessage;
        }));
        allMessages = allMessages.sort((lhs, rhs) => {
            if (lhs.timestamp === rhs.timestamp)
                return 0;
            else if (lhs.timestamp > rhs.timestamp)
                return -1;
            else
                return 1;
        });
        this.setState({
            messages: allMessages
        });
    }

    private loadMore = () => {
        let from: Date | undefined = new Date();
        let to = new Date();

        if (this.lastLoadedMessageTimestamp) {
            to = new Date(this.lastLoadedMessageTimestamp.getTime() - 1000);
        }

        switch (this.state.interval) {
            case MessagesTimeInterval.None:
                from = new Date(from.getTime() - 24 * 60 * 60 * 1000);
                break;

            case MessagesTimeInterval.Day:
                from = new Date(from.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;

            case MessagesTimeInterval.Week:
                from = new Date(from.getTime() - 31 * 24 * 60 * 60 * 1000);
                break;

            case MessagesTimeInterval.Month:
                from = new Date(from.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;

            case MessagesTimeInterval.Year:
                from = undefined;
                break;

            case MessagesTimeInterval.All:
                return;
        }

        console.log("RET MSG from " + from + "  to " + to);

        this.props.client.readMessages(from, to);
    };

    onDeviceMessage(message: SIDeviceMessage) {
        if (message.accessId === this.props.deviceAccess?.id) {
            this.addMessages(true, message);
        }
    }

    onMessageRead(status: SIStatus, count: number, messages: SIDeviceMessage[]) {
        if (status === SIStatus.SUCCESS) {
            this.addMessages(false, ...messages.filter((message: SIDeviceMessage) => message.accessId === this.props.deviceAccess?.id));
            this.setState({
                interval:  this.state.interval + 1
            });
        }
        if (messages.length > 0) {
            this.lastLoadedMessageTimestamp = messages[0].timestamp;
        }
    }
}

export default Messages;
