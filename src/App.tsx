import React from 'react';
import SIGatewayParentComponent from "./SIGatewayParentComponent";
import {SIAccessLevel, SIDescriptionFlags, SIGatewayClient, SIStatus} from "@openstuder/openstuder";
import Dashboard from "./Dashboard";
import Login from './Login'
import logo from "./resources/images/OpenStuder.svg";
import {ReactComponent as DashboardIcon} from "./resources/icons/Dashboard.svg"
import {ReactComponent as DataLogIcon} from "./resources/icons/Datalog.svg"
import {ReactComponent as MessagesIcon} from "./resources/icons/Messages.svg"
import {ReactComponent as PropertiesIcon} from "./resources/icons/Properties.svg"
import {ReactComponent as LogoutIcon} from "./resources/icons/Logout.svg"
import {ReactComponent as InstallationIcon} from "./resources/icons/Installation.svg";
import Messages from "./Messages";
import Datalogs from "./Datalogs";
import PropertyEditor from "./PropertyEditor";
import DeviceAccessSelector from "./DeviceAccessSelector";
import {DeviceAccessDescription, GatewayDescription} from "./Description";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {Theme} from "./ThemeChooser";
import ToastHelper from "./ToastHelper";

enum View {
    Dashboard,
    Datalogs,
    Messages,
    Properties,
    Selector
}

interface AppProperties {
    host: string
    port: number
}

type AppState = {
    connected: boolean,
    currentView: View,
    selectedDeviceAccessId?: string,
    theme: Theme | undefined,
    accentColor: string | undefined
}

class App extends SIGatewayParentComponent<AppProperties, AppState> {
    static defaultProps = {
        host: "openstuder.lan", // TODO: window.location.hostname,
        port: 1987,
        user: null,
        password: null
    };

    private readonly client: SIGatewayClient;
    private description: GatewayDescription | undefined = undefined;

    private dashboard = React.createRef<Dashboard>();
    private datalogs = React.createRef<Datalogs>();
    private messages = React.createRef<Messages>();
    private propertiesEditor = React.createRef<PropertyEditor>();
    private login = React.createRef<Login>();

    constructor(props: AppProperties) {
        super(props);
        this.client = new SIGatewayClient();
        this.state = {
            connected: false,
            currentView: View.Dashboard,
            selectedDeviceAccessId: undefined,
            theme: undefined,
            accentColor: undefined
        };
    }

    public componentDidMount() {
        this.client.setCallback(this);
        this.updateActiveChild();
    }

    public componentDidUpdate(prevProps: Readonly<AppProperties>, prevState: Readonly<AppState>, snapshot?: any) {
        this.updateActiveChild();
    }

    private updateActiveChild() {
        if (this.login.current) this.setActiveChild(this.login.current);
        else if (this.dashboard.current) this.setActiveChild(this.dashboard.current);
        else if (this.datalogs.current) this.setActiveChild(this.datalogs.current);
        else if (this.messages.current) this.setActiveChild(this.messages.current);
        else if (this.propertiesEditor.current) this.setActiveChild(this.propertiesEditor.current);
    }

    public render() {
        if (this.state.connected) {
            return (
                <div className="App">
                        <div className="sidenav">
                            <img className="logo" src={logo} alt="Logo"/>
                            <button
                                className={this.state.currentView === View.Dashboard ? "active" : ""}
                                disabled={this.state.selectedDeviceAccessId === undefined}
                                onClick={() => this.changeView(View.Dashboard)}>
                                <DashboardIcon/>
                                <br/>Dashboard
                            </button>
                            <button
                                className={this.state.currentView === View.Datalogs ? "active" : ""}
                                disabled={this.state.selectedDeviceAccessId === undefined}
                                onClick={() => this.changeView(View.Datalogs)}>
                                <DataLogIcon/>
                                <br/>Datalogs
                            </button>
                            <button
                                className={this.state.currentView === View.Messages ? "active" : ""}
                                disabled={this.state.selectedDeviceAccessId === undefined}
                                onClick={() => this.changeView(View.Messages)}>
                                <MessagesIcon/><br/>Messages
                            </button>
                            <button
                                className={this.state.currentView === View.Properties ? "active" : ""}
                                disabled={this.state.selectedDeviceAccessId === undefined}
                                onClick={() => this.changeView(View.Properties)}>
                                <PropertiesIcon/>
                                <br/>Properties
                            </button>
                            {this.renderDeviceAccessSelector()}
                            <button
                                onClick={() => this.client.disconnect()}>
                                <LogoutIcon/>
                                <br/>Logout
                            </button>
                        </div>
                    <div className="content">
                        {this.renderContent()}
                    </div>
                    {this.state.currentView !== View.Dashboard &&
                        <ToastContainer
                            hideProgressBar={true}
                            theme="colored"
                            autoClose={10000}
                            newestOnTop={true}/> }
                </div>
            );
        } else {
            return (
                <div className="App">
                    <Login ref={this.login} host={this.props.host} port={this.props.port} client={this.client}/>
                    <ToastContainer
                        hideProgressBar={true}
                        theme="colored"
                        autoClose={10000}
                        newestOnTop={true}/>
                </div>
            );
        }
    }

    private renderDeviceAccessSelector() {
        if ((this.description?.instances?.length || 0) > 1) {
            return (
                <button
                    className={this.state.currentView === View.Selector ? "active" : ""}
                    onClick={() => this.changeView(View.Selector)}>
                    <InstallationIcon/>
                    <br/>Select Installation
                </button>
            )
        }
    }

    private renderContent() {
        switch (this.state.currentView) {
            case View.Dashboard:
                return (
                    <Dashboard ref={this.dashboard}
                               client={this.client}
                               deviceAccess={this.description?.instances.find((it) => it.id === this.state.selectedDeviceAccessId)}
                               showDeviceAccess={(this.description?.instances.length || 0) > 1}/>
                );
            case View.Datalogs:
                return (
                    <Datalogs ref={this.datalogs}
                              client={this.client}
                              deviceAccess={this.description?.instances.find((it) => it.id === this.state.selectedDeviceAccessId)}/>
                );
            case View.Messages:
                return (
                    <Messages ref={this.messages}
                              client={this.client}
                              deviceAccess={this.description?.instances.find((it) => it.id === this.state.selectedDeviceAccessId)}/>
                );
            case View.Properties:
                return (
                    <PropertyEditor ref={this.propertiesEditor}
                                    client={this.client}
                                    deviceAccess={this.description?.instances.find((it) => it.id === this.state.selectedDeviceAccessId)}/>
                );

            case View.Selector:
                return (
                    <DeviceAccessSelector
                        deviceAccesses={this.description!.instances.map((it: DeviceAccessDescription) => it.id)}
                        onSelected={this.onDeviceAccessSelected}
                    />
                )
        }
    }

    onConnected(accessLevel: SIAccessLevel, gatewayVersion: string) {
        super.onConnected(accessLevel, gatewayVersion);
        this.client.describe(undefined, undefined, undefined, [SIDescriptionFlags.INCLUDE_ACCESS_INFORMATION, SIDescriptionFlags.INCLUDE_DEVICE_INFORMATION, SIDescriptionFlags.INCLUDE_PROPERTY_INFORMATION])
    }

    onDisconnected() {
        super.onDisconnected();
        this.description = undefined;
        this.setState({
            connected: false,
            currentView: View.Dashboard,
            selectedDeviceAccessId: undefined
        });
    }

    onDescription(status: SIStatus, description: string, id?: string) {
        if (id === undefined && status === SIStatus.SUCCESS) {
            this.description = JSON.parse(description) as GatewayDescription;

            switch (this.description.instances.length) {
                case 0:
                    this.setState({
                        currentView: View.Selector,
                        connected: true
                    })
                    break;

                case 1:
                    this.setState({
                        currentView: View.Dashboard,
                        connected: true,
                        selectedDeviceAccessId: this.description.instances[0].id
                    });
                    break;

                default:
                    this.setState({
                        currentView: View.Selector,
                        connected: true,
                        selectedDeviceAccessId: undefined
                    });
            }
        }
    }

    onError(reason: string): void {
        ToastHelper.error(undefined, reason);
        super.onError(reason);
    }

    private onDeviceAccessSelected = (deviceAccess: string) => {
        this.setState({
            currentView: View.Dashboard,
            selectedDeviceAccessId: deviceAccess
        })
    }

    public changeView(newView: View) {
        this.setState({
            currentView: newView
        });
    }
}

export default App;
