import React from "react";
import {SIAccessLevel, SIConnectionState, SIDeviceMessage, SIGatewayClientCallbacks, SIPropertyReadResult, SIStatus, SISubscriptionsResult} from "@openstuder/openstuder";

class SIGatewayParentComponent<P, S> extends React.Component<P, S> implements SIGatewayClientCallbacks {
    private activeChild: SIGatewayClientCallbacks | null = null;

    protected setActiveChild(child: SIGatewayClientCallbacks | null) {
        this.activeChild = child;
    }

    onConnected(accessLevel: SIAccessLevel, gatewayVersion: string): void {
        if (this.activeChild) this.activeChild.onConnected(accessLevel, gatewayVersion);
    }

    onDatalogPropertiesRead(status: SIStatus, properties: string[]): void {
        if (this.activeChild) this.activeChild.onDatalogPropertiesRead(status, properties);
    }

    onDatalogRead(status: SIStatus, propertyId: string, count: number, values: string): void {
        if (this.activeChild) this.activeChild.onDatalogRead(status, propertyId, count, values);
    }

    onDescription(status: SIStatus, description: string, id?: string): void {
        if (this.activeChild) this.activeChild.onDescription(status, description, id);
    }

    onDeviceMessage(message: SIDeviceMessage): void {
        if (this.activeChild) this.activeChild.onDeviceMessage(message);
    }

    onDisconnected(): void {
        if (this.activeChild) this.activeChild.onDisconnected();
    }

    onEnumerated(status: SIStatus, deviceCount: number): void {
        if (this.activeChild) this.activeChild.onEnumerated(status, deviceCount);
    }

    onError(reason: string): void {
        if (this.activeChild) this.activeChild.onError(reason);
    }

    onMessageRead(status: SIStatus, count: number, messages: SIDeviceMessage[]): void {
        if (this.activeChild) this.activeChild.onMessageRead(status, count, messages);
    }

    onPropertiesFound(status: SIStatus, id: string, count: number, properties: string[]): void {
        if (this.activeChild) this.activeChild.onPropertiesFound(status, id, count, properties);
    }

    onPropertiesRead(results: SIPropertyReadResult[]): void {
        if (this.activeChild) this.activeChild.onPropertiesRead(results);
    }

    onPropertiesSubscribed(statuses: SISubscriptionsResult[]): void {
        if (this.activeChild) this.activeChild.onPropertiesSubscribed(statuses);
    }

    onPropertiesUnsubscribed(statuses: SISubscriptionsResult[]): void {
        if (this.activeChild) this.activeChild.onPropertiesUnsubscribed(statuses);
    }

    onPropertyRead(status: SIStatus, propertyId: string, value?: string): void {
        if (this.activeChild) this.activeChild.onPropertyRead(status, propertyId, value);
    }

    onPropertySubscribed(status: SIStatus, propertyId: string): void {
        if (this.activeChild) this.activeChild.onPropertySubscribed(status, propertyId);
    }

    onPropertyUnsubscribed(status: SIStatus, propertyId: string): void {
        if (this.activeChild) this.activeChild.onPropertyUnsubscribed(status, propertyId);
    }

    onPropertyUpdated(propertyId: string, value: any): void {
        if (this.activeChild) this.activeChild.onPropertyUpdated(propertyId, value);
    }

    onPropertyWritten(status: SIStatus, propertyId: string): void {
        if (this.activeChild) this.activeChild.onPropertyWritten(status, propertyId);
    }
}

export default SIGatewayParentComponent;
