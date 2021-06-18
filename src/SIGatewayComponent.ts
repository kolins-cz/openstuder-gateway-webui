import React from "react";
import {SIAccessLevel, SIConnectionState, SIDeviceMessage, SIGatewayClientCallbacks, SIPropertyReadResult, SIStatus, SISubscriptionsResult} from "@openstuder/openstuder";

class SIGatewayComponent<P, S> extends React.Component<P, S> implements SIGatewayClientCallbacks {
    onConnected(accessLevel: SIAccessLevel, gatewayVersion: string): void {}
    onDatalogPropertiesRead(status: SIStatus, properties: string[]): void {}
    onDatalogRead(status: SIStatus, propertyId: string, count: number, values: string): void {}
    onDescription(status: SIStatus, description: string, id?: string): void {}
    onDeviceMessage(message: SIDeviceMessage): void {}
    onDisconnected(): void {}
    onEnumerated(status: SIStatus, deviceCount: number): void {}
    onError(reason: string): void {}
    onMessageRead(status: SIStatus, count: number, messages: SIDeviceMessage[]): void {}
    onPropertiesFound(status: SIStatus, id: string, count: number, properties: string[]): void {}
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