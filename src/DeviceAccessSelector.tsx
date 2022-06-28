import React from "react";
import SIGatewayComponent from "./SIGatewayComponent";

interface DeviceAccessSelectorProperties {
    deviceAccesses: Array<string>,
    onSelected: (deviceAccess: string) => void
}

class DeviceAccessSelector extends SIGatewayComponent<DeviceAccessSelectorProperties, {}> {
    public render() {
        return (
            <div className="selector">
                {this.renderDeviceAccessSelector()}
            </div>
        );
    }

    private renderDeviceAccessSelector() {
        switch (this.props.deviceAccesses.length) {
            case 0:
                return (
                    <div>
                        <h1>No installation present.</h1>
                        <p>
                            Either no device access drivers were configured, the configuration is invalid or the gateway is not correctly working.
                        </p>
                        <p>
                            Refer to the <a href="https://www.openstuder.io/#/gateway?id=device-access-driver-configuration-etcopenstuderdriversconf" target="_blank" rel="noreferrer">Device access driver
                            configuration</a> section
                            of the open<b>studer</b> documentation in order to configure your installation.
                        </p>
                    </div>
                )

            case 1:
                return (
                    <div>
                        <h1>Nothing to select.</h1>
                        <p>There is only one installation present.</p>
                    </div>
                )

            default:
                return (
                    <div>
                        <p>Select installation:</p>
                        {this.props.deviceAccesses.map((deviceAccess) => (
                            <button id={deviceAccess} onClick={() => this.props.onSelected(deviceAccess)}>{deviceAccess}</button>
                        ))}
                    </div>
                )
        }
    }
}

export default DeviceAccessSelector;
