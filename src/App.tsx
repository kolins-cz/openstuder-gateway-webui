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
import Messages from "./Messages";
import Datalogs from "./Datalogs";
import PropertiesEditor from "./PropertiesEditor";

enum View {
    Dashboard,
    Datalogs,
    Messages,
    Properties
}

interface AppProperties {
    host: string
    port: number
}

type AppState = {
    connected: boolean,
    currentView: View,
}

class App extends SIGatewayParentComponent<AppProperties, AppState> {
    static defaultProps = {
        host: window.location.hostname,
        port: 1987,
        user: null,
        password: null
    };

    private readonly client: SIGatewayClient;
    private description: any | undefined = undefined;

    private dashboard = React.createRef<Dashboard>();
    private datalogs = React.createRef<Datalogs>();
    private messages = React.createRef<Messages>();
    private propertiesEditor = React.createRef<PropertiesEditor>();
    private login = React.createRef<Login>();
    
    constructor(props: AppProperties) {
        super(props);
        this.client = new SIGatewayClient();
        this.state = {
            connected: false,
            currentView: View.Dashboard,
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
                            <a
                                className={this.state.currentView === View.Dashboard ? "active" : ""}
                                href="#"
                                onClick={() => this.changeView(View.Dashboard)}>
                                <DashboardIcon/>
                                <br/>Dashboard
                            </a>
                            <a
                                className={this.state.currentView === View.Datalogs ? "active" : ""}
                                href="#"
                                onClick={() => this.changeView(View.Datalogs)}>
                                <DataLogIcon/>
                                <br/>Datalogs
                            </a>
                            <a
                                className={this.state.currentView === View.Messages ? "active" : ""}
                                href="#"
                                onClick={() => this.changeView(View.Messages)}>
                                <MessagesIcon/><br/>Messages
                            </a>
                            <a
                                className={this.state.currentView === View.Properties ? "active" : ""}
                                href="#"
                                onClick={() => this.changeView(View.Properties)}>
                                <PropertiesIcon/>
                                <br/>Properties
                            </a>
                            <a
                                href="#"
                                onClick={() => this.client.disconnect()}>
                                <LogoutIcon/>
                                <br/>Logout
                            </a>
                        </div>
                    <div className="content">
                        {this.renderContent()}
                    </div>
                </div>
            );
        } else {
            return (
                <Login ref={this.login} host={this.props.host} port={this.props.port} client={this.client}/>
            );
        }
    }

    private renderContent() {
        switch (this.state.currentView) {
            case View.Dashboard:
                return (
                    <Dashboard ref={this.dashboard} client={this.client}/>
                );
            case View.Datalogs:
                return (
                    <Datalogs ref={this.datalogs} client={this.client} description={this.description}/>
                );
            case View.Messages:
                return (
                    <Messages ref={this.messages} client={this.client}/>
                );
            case View.Properties:
                return (
                    <PropertiesEditor ref={this.propertiesEditor} client={this.client} model={this.description}/>
                );
        }
    }

    onConnected(accessLevel: SIAccessLevel, gatewayVersion: string) {
        super.onConnected(accessLevel, gatewayVersion);
        this.setState({
            currentView: View.Dashboard,
            connected: true
        });
        this.client.describe(undefined, undefined, undefined, [SIDescriptionFlags.INCLUDE_ACCESS_INFORMATION, SIDescriptionFlags.INCLUDE_DEVICE_INFORMATION, SIDescriptionFlags.INCLUDE_PROPERTY_INFORMATION])
    }

    onDisconnected() {
        super.onDisconnected();
        this.setState({
            connected: false
        });
    }

    onDescription(status: SIStatus, description: string, id?: string) {
        if (status == SIStatus.SUCCESS) {
            this.description = JSON.parse(description);
        }
    }

    onError(reason: string): void {
        super.onError(reason);
        console.log(reason);
    }

    public changeView(newView: View) {
        this.setState({currentView: newView});
    }
    
    /*public renderConnected(){
        return (
            <div className="App">
              {this.renderSidebar()}
              <div className="content">{this.renderContent()}</div>
            </div>
        );
      }

      public renderSidebar(){
        let varioTrackMCSubLink;
        let varioTrackVT65SubLink;
        let xTenderXTSSubLink;
        let xTenderMCSubLink;
        this.state.devices.devices.map(device=>{
          if(device.model.includes("VarioTrack VT-65")){
            varioTrackVT65SubLink=<a className="subLink" href={"#"+device.model} onClick={()=>this.changeView(View.VarioTrack)}>-{device.model}</a>
          }
          if(device.model.includes("Xtender XTS")){
            xTenderXTSSubLink=<a className="subLink" href={"#"+device.model} onClick={()=>this.changeView(View.XTender)}>-{device.model}</a>
          }
          if(device.model.includes("VarioTrack multicast")){
            varioTrackMCSubLink=<a className="subLink" href={"#"+device.model} onClick={()=>this.changeView(View.VarioTrack)}>-{device.model}</a>
          }
          if(device.model.includes("Xtender multicast")){
            xTenderMCSubLink=<a className="subLink" href={"#"+device.model} onClick={()=>this.changeView(View.XTender)}>-{device.model}</a>
          }
        });
        return(
            <div>
              <div className="sidenav">
                <img className="logo" src={logo}/>
                <a className="active" href="#" onClick={()=>this.changeView(View.Dashboard)}><img src={dashboardIcon}/><br/>Dashboard</a>
                <a href="#"><img src={datalogIcon}/><br/>Datalogs</a>
                <a href="#" onClick={()=>this.changeView(View.Messages)}><img src={messagesIcon}/><br/>Messages</a>
                <a href="#"><img src={remoteIcon}/><br/>Remote control</a>
                <a href="#"><img src={propertiesIcon}/><br/>Properties</a>
              </div>
            </div>
        );
      }

      public renderContent(){
        switch(this.state.currentView){
          case View.Dashboard:
            return(
                <div>{this.renderSystemInfo()}</div>
            );
          case View.Messages:
            return(
                <div>{this.renderEventsRecord()}</div>
            );
          case View.Battery:
            return(
                <div>{this.renderBattery()}</div>
            );
          case View.VarioTrack:
            return(
                <div>{this.renderVarioTrack()}</div>
            );
          case View.XTender:
            return(
                <div>{this.renderXTender()}</div>
            );
        }
      }

      public renderSystemInfo(){
        let batteryDevice = this.state.devices.findDevice("bat");
        let varioTrackDevice = this.state.devices.findDevice("vts");
        let xTenderDevice = this.state.devices.findDevice("xts");
        return(
            <SystemInfo  battery={batteryDevice} varioTrack={varioTrackDevice} xTender={xTenderDevice}/>
        );
      }

      public renderEventsRecord(){
        return(
            <div>
              <DeviceMessagesRender messages={this.state.messages} onSubmit={(dateFrom, dateTo) => this.onSubmitReadMessagesTask(dateFrom,dateTo)}/>
            </div>
        );
      }

      public renderBattery(){
        let batteryDevice:Device|undefined;
        this.state.devices.devices.map(device=>{
          if(device.model==="BSP"){
            batteryDevice=device;
          }
        });
        if(batteryDevice) {
          return (
              <DeviceRender device={batteryDevice} onClick={(id:string)=>this.onClick(id)} onSubmit={(id,value)=>this.onSubmitWrittenTask(id,value)}
                            onSubscribeTask={(id,subscribing)=>this.onSubscribeTask(id,subscribing)}/>
          );
        }
        else{
          return(
              <div>No BSP device found</div>
          );
        }
      }

      public renderVarioTrack(){
        return(
            <div>
              {this.state.devices.devices.map(device=>{
                if(device.model.includes("VarioTrack")){
                  return <DeviceRender device={device} onClick={(id:string)=>this.onClick(id)} onSubmit={()=>this.onSubmitWrittenTask}
                                       onSubscribeTask={(id,subscribing)=>this.onSubscribeTask(id,subscribing)}/>
                }
              })}
            </div>
        );
      }

      public renderXTender(){
        return(
            <div>
              {this.state.devices.devices.map(device=>{
                if(device.model.includes("Xtender")){
                  return <DeviceRender device={device} onClick={(id:string)=>this.onClick(id)} onSubmit={()=>this.onSubmitWrittenTask}
                                       onSubscribeTask={(id,subscribing)=>this.onSubscribeTask(id,subscribing)}/>
                }
              })}
            </div>
        );
      }*/
}

export default App;
