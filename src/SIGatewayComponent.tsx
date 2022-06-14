import React from "react";
import {SIAccessLevel, SIDeviceFunctions, SIDeviceMessage, SIGatewayClientCallbacks, SIPropertyReadResult, SIStatus, SISubscriptionsResult} from "@openstuder/openstuder";
import ToastHelper from "./ToastHelper";

class SIGatewayComponent<P, S> extends React.Component<P, S> implements SIGatewayClientCallbacks {
    onDeviceMessage(message: SIDeviceMessage): void {
        if (message.message.startsWith("Halted:")) {
            ToastHelper.halted(message.accessId + '.' + message.deviceId, message.message);
        } else if (message.message.startsWith("Error:")) {
            ToastHelper.error(message.accessId + '.' + message.deviceId, message.message);
        } else if (message.message.startsWith("Warning:")) {
            ToastHelper.warning(message.accessId + '.' + message.deviceId, message.message);
        } else {
            ToastHelper.info(message.accessId + '.' + message.deviceId, message.message);
        }
    }

    onConnected(accessLevel: SIAccessLevel, gatewayVersion: string): void {}
    onDatalogPropertiesRead(status: SIStatus, properties: string[]): void {}
    onDatalogRead(status: SIStatus, propertyId: string, count: number, values: string): void {}
    onDescription(status: SIStatus, description: string, id?: string): void {}
    onDisconnected(): void {}
    onEnumerated(status: SIStatus, deviceCount: number): void {}
    onError(reason: string): void {}
    onMessageRead(status: SIStatus, count: number, messages: SIDeviceMessage[]): void {}
    onPropertiesFound(status: SIStatus, id: string, count: number, virtual: boolean, functions: Set<SIDeviceFunctions>, properties: string[]): void {}
    onPropertiesRead(results: SIPropertyReadResult[]): void {}
    onPropertiesSubscribed(statuses: SISubscriptionsResult[]): void {}
    onPropertiesUnsubscribed(statuses: SISubscriptionsResult[]): void {}
    onPropertyRead(status: SIStatus, propertyId: string, value?: string): void {}
    onPropertySubscribed(status: SIStatus, propertyId: string): void {}
    onPropertyUnsubscribed(status: SIStatus, propertyId: string): void {}
    onPropertyUpdated(propertyId: string, value: any): void {}
    onPropertyWritten(status: SIStatus, propertyId: string): void {}
}

export default SIGatewayComponent;