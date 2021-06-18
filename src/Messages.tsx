import React from "react";
import SIGatewayComponent from "./SIGatewayComponent";
import {SIDeviceMessage, SIGatewayClient, SIStatus} from "@openstuder/openstuder";
import NotificationIcon from './resources/icons/Notification.svg';
import WarningIcon from './resources/icons/Warning.svg';
import ErrorIcon from './resources/icons/Error.svg';
import HaltedIcon from './resources/icons/Halted.svg';

interface MessagesProperties {
    client: SIGatewayClient
}

type Message = SIDeviceMessage & { highlighted: boolean }

class MessagesState {
    messages = Array<Message>();
}

class Messages extends SIGatewayComponent<MessagesProperties, MessagesState> {
    public constructor(props: MessagesProperties) {
        super(props);
        this.state = new MessagesState();
    }

    public componentDidMount() {
        this.setState({
            messages: []
        });
        this.loadMore();
    }

    public render() {
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
                        <tr className={message.highlighted ? "highlighted" : ""} key={message.timestamp /* TODO: Message.timestamp should be a date: .getTime().toString()*/ + '-' + message.messageId}>
                            <td className="type">
                                <img src={message.message.startsWith('Halted:') ? HaltedIcon : message.message.startsWith("Error:") ? ErrorIcon : message.message.startsWith("Warning:") ? WarningIcon : NotificationIcon}/>
                            </td>
                            <td className="timestamp">{message.timestamp.toLocaleString()}</td>
                            <td className="id">{message.accessId}.{message.deviceId}</td>
                            <td className="content">{message.message} <span className="id">({message.messageId})</span></td>
                        </tr>
                    ))}
                    <tr className="more">
                        <td colSpan={4}>
                            <button className="more" onClick={this.loadMore}>fetch older messages...</button>
                        </td>
                    </tr>
                    </tbody>
                </table>
                </div>
            </div>
        )
    }

    private addMessages(...messages: Array<SIDeviceMessage>) {
        let allMessages = this.state.messages;
        allMessages.forEach((message) => message.highlighted = false);
        allMessages.push(...messages.map((message) => {
            let newMessage = message as Message;
            newMessage.highlighted = messages.length == 1;
            return newMessage;
        }));
        allMessages = allMessages.sort((lhs, rhs) => lhs.timestamp > rhs.timestamp ? -1 : lhs.timestamp < rhs.timestamp ? 1 : 0)
        this.setState({
            messages: allMessages
        });
    }

    private loadMore = () => {
        const messages = this.state.messages;
        if (messages.length > 0) {
            let lastTimestamp = new Date(messages[messages.length - 1].timestamp);
            lastTimestamp.setSeconds(lastTimestamp.getSeconds() - 1);
            this.props.client.readMessages(undefined, lastTimestamp, 32);
        } else {
            this.props.client.readMessages(undefined, undefined, 64);
        }
    };

    onDeviceMessage(message: SIDeviceMessage) {
        this.addMessages(message);
    }

    onMessageRead(status: SIStatus, count: number, messages: SIDeviceMessage[]) {
        if (status == SIStatus.SUCCESS) {
            this.addMessages(...messages);
        }
    }
}

export default Messages;
