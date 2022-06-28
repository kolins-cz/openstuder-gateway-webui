import SIGatewayComponent from "./SIGatewayComponent";
import {SIExtensionStatus, SIGatewayClient} from "@openstuder/openstuder";
import React, {createRef} from "react";
import Spinner from "./Spinner";
import ToastHelper from "./ToastHelper";

interface WifiConfigProperties {
    client: SIGatewayClient
}

type WifiStatus = {
    clientEnabled: boolean
    clientConnected: boolean
    clientSSID: string
    clientIP: string
    apEnabled: boolean
    apSSID: string
    wiredConnected: boolean
    wiredIP: string
}

type WifiScanResult = {
    ssid: string,
    signal: number,
    encrypted: boolean
}

class WifiConfigState {
    constructor() {
        this.status = undefined;
        this.scannedNetworks = [];
        this.clientEnabled = false;
        this.clientSSID = "";
        this.clientPasskey = "";
        this.apEnabled = false;
        this.apSSID = "";
        this.apPasskey = "";
    }

    status: WifiStatus | undefined

    scannedNetworks: Array<WifiScanResult>;
    scannedDialogShown: boolean = false;

    clientEnabled: boolean
    clientSSID: string
    clientPasskey: string

    apEnabled: boolean
    apSSID: string
    apPasskey: string
}

class WifiConfig extends SIGatewayComponent<WifiConfigProperties, WifiConfigState> {
    private wifiNetworkListDialog: HTMLDivElement | null = null;
    private spinner = createRef<Spinner>();
    private timerID: any;

    constructor(props: WifiConfigProperties) {
        super(props);
        this.state = new WifiConfigState();
    }

    componentDidMount() {
        this.updateStatus();
    }

    componentWillUnmount() {
        if (this.timerID) {
            clearTimeout(this.timerID);
        }
    }

    render() {
        return <div className="wifi-config">
            {this.state.status && <div className="form">
                <h1>Status:</h1><br/>
                <div className="form-row">
                    <div className="label">WiFi Client state:</div>
                    <div className="value">
                        {(this.state.status.clientConnected && `Connected to ${this.state.status.clientSSID} (${this.state.status.clientIP})`) || 'Not connected'}
                    </div>
                </div>
                <hr/>
                <div className="form-row">
                    <div className="label">Access Point state:</div>
                    <div
                        className="value">{(this.state.status.apEnabled && `Enabled with SSID ${this.state.status.apSSID}`) || 'Not enabled'}</div>
                </div>
                <hr/>
                <div className="form-row">
                    <div className="label">Wired Ethernet state:</div>
                    <div
                        className="value">{(this.state.status.wiredConnected && `Connected (${this.state.status.wiredIP})`) || 'Not connected'}</div>
                </div>
            </div>}
            <div className="form">
                <h1>Wifi client configuration:</h1>
                <br/>
                <div className="form-row">
                    <div>Enabled:</div>
                    <div>
                        <label className="switch medium">
                            <input type="checkbox" checked={this.state.clientEnabled}
                                   onClick={() => this.setState({clientEnabled: !this.state.clientEnabled})}/>
                            <span className="slider"/>
                        </label>
                    </div>
                </div>
                <div className="form-row">
                    <div>SSID:</div>
                    <div>
                        <input type="text" className="medium" list="scanned-networks" value={this.state.clientSSID}
                               disabled={!this.state.clientEnabled}
                               onChange={(event) => this.setState({clientSSID: event.target.value})}/>
                    </div>
                </div>
                <div className="form-row">
                    <div>Passkey:</div>
                    <div>
                        <input type="password" className="medium" value={this.state.clientPasskey}
                               disabled={!this.state.clientEnabled}
                               onChange={(event) => this.setState({clientPasskey: event.target.value})}/>
                    </div>
                </div>
                <div>
                    <button className="medium" onClick={this.onScanForNetworksButtonClicked}
                    disabled={!this.state.clientEnabled}>Search networks...</button>
                    <button className="medium"
                            disabled={this.state.clientEnabled && (this.state.clientSSID.length === 0 ||
                                (this.state.clientPasskey.length !== 0 && this.state.clientPasskey.length < 8))}
                            onClick={this.applyClientSettings}>Apply
                    </button>
                </div>
            </div>
            <div className="form">
                <h1>Wifi access point configuration:</h1>
                <br/>
                <div className="form-row">
                    <div>Enabled:</div>
                    <div>
                        <label className="switch medium">
                            <input type="checkbox" checked={this.state.apEnabled}
                                   onClick={() => this.setState({apEnabled: !this.state.apEnabled})}/>
                            <span className="slider"/>
                        </label>
                    </div>
                </div>
                <div className="form-row">
                    <div>SSID:</div>
                    <div>
                        <input type="text" className="medium" value={this.state.apSSID} disabled={!this.state.apEnabled}
                               onChange={(event) => this.setState({apSSID: event.target.value})}/>
                    </div>
                </div>
                <div className="form-row">
                    <div>Passkey:</div>
                    <div>
                        <input type="password" className="medium" value={this.state.apPasskey}
                               disabled={!this.state.apEnabled}
                               onChange={(event) => this.setState({apPasskey: event.target.value})}/>
                    </div>
                </div>
                <div>
                    <button className="medium"
                            disabled={this.state.apEnabled && (this.state.apSSID.length === 0 || this.state.apPasskey.length < 8)}
                            onClick={this.applyAPSettings}>Apply
                    </button>
                </div>
            </div>
            <div ref={(it) => this.wifiNetworkListDialog = it} className="modal" style={{
                display: this.state.scannedDialogShown ? 'flex' : 'none'
            }}>
                <div className="form">
                    <h1>Select WiFi network</h1>
                    <div className="network-list">
                        {this.state.scannedNetworks.map((network) =>
                            <div className="network" onClick={() => this.setState({
                                scannedDialogShown: false,
                                clientSSID: network.ssid
                            })}>
                                <div className="title">{network.ssid}</div>
                                <div className="props">{network.signal}dBm, {network.encrypted ? "Encrypted" : "Open"}</div>
                            </div>
                        )}
                    </div>
                    <br/>
                    <button onClick={() => this.setState({scannedDialogShown: false})}>Cancel</button>
                </div>
            </div>
            <Spinner ref={this.spinner}/>
        </div>;
    }

    private updateStatus = () => {
        this.props.client.callExtension("WifiConfig", "status");
    };

    private onScanForNetworksButtonClicked = () => {
        this.spinner.current?.show();
        this.props.client.callExtension("WifiConfig", "scan");
    }

    private applyClientSettings = () => {
        this.spinner.current?.show();
        this.props.client.callExtension("WifiConfig", "cliconf", new Map<string, string>([
            ["enabled", this.state.clientEnabled ? "true" : "false"],
            ["ssid", this.state.clientSSID],
            ["passkey", this.state.clientPasskey]
        ]));
    };

    private applyAPSettings = () => {
        this.spinner.current?.show();
        this.props.client.callExtension("WifiConfig", "apconf", new Map<string, string>([
            ["enabled", this.state.apEnabled ? "true" : "false"],
            ["ssid", this.state.apSSID],
            ["passkey", this.state.apPasskey]
        ]));
    };

    onExtensionCalled(extension: string, command: string, status: SIExtensionStatus, parameters: Map<string, string>, body: string) {
        if (extension === "WifiConfig") {
            if (command === "status") {
                if (status === SIExtensionStatus.SUCCESS) {
                    let firstTime = this.state.status === undefined;
                    this.setState({
                        status: {
                            clientEnabled: parameters.get("client_enabled") === "true",
                            clientConnected: parameters.get("client_connected") === "true",
                            clientSSID: parameters.get("client_ssid") || "",
                            clientIP: parameters.get("client_ip") || "",
                            apEnabled: parameters.get("ap_enabled") === "true",
                            apSSID: parameters.get("ap_ssid") || "",
                            wiredConnected: parameters.get("wired_connected") === "true",
                            wiredIP: parameters.get("wired_ip") || ""
                        },
                        clientEnabled: firstTime ? parameters.get("client_enabled") === "true" : this.state.clientEnabled,
                        clientSSID: firstTime ? parameters.get("client_ssid") || "" : this.state.clientSSID,
                        apEnabled: firstTime ? parameters.get("ap_enabled") === "true" : this.state.apEnabled,
                        apSSID: firstTime ? parameters.get("ap_ssid") || "" : this.state.apSSID,
                    });
                    this.timerID = setTimeout(this.updateStatus, 10000);
                } else {
                    this.timerID = setTimeout(this.updateStatus, 5000);
                }
            } else if (command === "scan") {
                this.spinner.current?.hide();
                if (status === SIExtensionStatus.SUCCESS) {
                    try {
                        const networks = JSON.parse(body) as Array<WifiScanResult>;
                        this.setState({
                            scannedDialogShown: true,
                            scannedNetworks: networks
                        });
                        return;
                    } catch (e) {
                    }
                }
                ToastHelper.error(undefined, "Failed to scan for WiFi networks");
            } else if (command === "cliconf") {
                this.spinner.current?.hide();
                if (status === SIExtensionStatus.SUCCESS) {
                    ToastHelper.info(undefined, "WiFi client configuration changed")
                } else {
                    ToastHelper.error(undefined, "Failed to change WiFi client configuration")
                }
            } else if (command === "apconf") {
                this.spinner.current?.hide();
                if (status === SIExtensionStatus.SUCCESS) {
                    ToastHelper.info(undefined, "WiFi access point configuration changed")
                } else {
                    ToastHelper.error(undefined, "Failed to change WiFi access point configuration")
                }
            }
        }
    }
}

export default WifiConfig