import SIGatewayComponent from "./SIGatewayComponent";
import React, {createRef} from "react";
import {
    SIAccessLevel,
    SIDeviceFunctions,
    SIGatewayClient,
    SIPropertyReadResult,
    SIStatus
} from "@openstuder/openstuder";
import Spinner from "./Spinner";
import {DeviceAccessDescription, DeviceDescription, findPropertiesIds, PropertyDescription} from "./Description";
import fscreen from 'fscreen';
import {ToastContainer} from "react-toastify";
import {ReactComponent as EnterFullscreen} from "./resources/icons/EnterFullscreen.svg";
import {ReactComponent as ExitFullscreen} from "./resources/icons/ExitFullscreen.svg";

interface DashboardProperties {
    client: SIGatewayClient
    deviceAccess?: DeviceAccessDescription,
    showDeviceAccess: boolean
}

class DashboardState {
    fullscreen: boolean = false;
}

class Dashboard extends SIGatewayComponent<DashboardProperties, DashboardState> {
    private dashboard = createRef<HTMLDivElement>();
    private canvas = createRef<HTMLCanvasElement>();
    private spinner = createRef<Spinner>();

    private solarInPowerIds = Array<string>();
    private solarInPowerSum?: number = undefined;

    private acOutPowerIds = Array<string>();
    private acOutPowerSum?: number = undefined;

    private batteryInPowerId?: string = undefined;
    private batteryInPower?: number = undefined;

    private batteryChargeLevelId?: string = undefined;
    private batteryChargeLevel?: number = undefined;

    private acInPowerIds = Array<string>();
    private acInPowerSum?: number = undefined;

    private inverterOnId?: string = undefined;
    private inverterOn = false;

    private updateTimeoutId: number | undefined = undefined;

    constructor(props: DashboardProperties) {
        super(props);
        this.state = new DashboardState();
    }

    public componentDidMount() {
        this.renderCanvas();
        window.onresize = () => this.renderCanvas();
        fscreen.onfullscreenchange = () => this.setState({
            fullscreen: fscreen.fullscreenElement === this.dashboard.current
        });

        if (this.props.deviceAccess) {
            this.solarInPowerIds = findPropertiesIds(this.props.deviceAccess,
                (device: DeviceDescription) => !device.virtual,
                (property: PropertyDescription) => property.id === 11004 || property.id === 15010);
            this.acOutPowerIds = findPropertiesIds(this.props.deviceAccess,
                (device: DeviceDescription) => !device.virtual,
                (property: PropertyDescription) => property.id === 3136);
            this.batteryInPowerId = findPropertiesIds(this.props.deviceAccess,
                (device: DeviceDescription) => !device.virtual,
                (property: PropertyDescription) => property.id === 7003)[0];
            this.batteryChargeLevelId = findPropertiesIds(this.props.deviceAccess,
                (device: DeviceDescription) => !device.virtual,
                (property: PropertyDescription) => property.id === 7002)[0];
            this.acInPowerIds = findPropertiesIds(this.props.deviceAccess,
                (device: DeviceDescription) => !device.virtual,
                (property: PropertyDescription) => property.id === 3137);
            this.inverterOnId = findPropertiesIds(this.props.deviceAccess,
                (device: DeviceDescription) => !device.virtual,
                (property: PropertyDescription) => property.id === 3049)[0];
        }

        if (!this.updateTimeoutId) {
            this.update();
            this.spinner.current?.show(300);
        }
    }

    public componentWillUnmount() {
        if (this.updateTimeoutId) {
            clearTimeout(this.updateTimeoutId);
            this.updateTimeoutId = undefined;
        }
    }

    public render() {
        return (
            <div className="dashboard" ref={this.dashboard}>
                <div className="content">
                    <div className="background"/>
                    <canvas className="dashboard" ref={this.canvas} onClick={this.onCanvasClicked}/>
                    <Spinner ref={this.spinner}/>
                    {
                        fscreen.fullscreenEnabled && ((this.state.fullscreen &&
                            <ExitFullscreen className="exit-fullscreen" onClick={this.toggleFullscreen}/>) ||
                            <EnterFullscreen className="enter-fullscreen" onClick={this.toggleFullscreen}/>
                        )
                    }
                </div>
                <ToastContainer
                    hideProgressBar={true}
                    theme="colored"
                    autoClose={this.state.fullscreen ? 60000 : 10000}
                    newestOnTop={true}/>
            </div>
        )
    }

    private renderCanvas() {
        const canvas = this.canvas.current;
        if (canvas) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            const context = this.canvas.current?.getContext('2d');
            if (context) {
                context.translate(canvas.width / 2.0, canvas.height / 2.0);
                const scale = Math.min(canvas.width / 560, canvas.height / 500);
                context.scale(scale, scale);
                context.textAlign = "right";
                context.font = "bold 18px Avenir Next, Arial";
                context.fillStyle = 'rgb(' + (document.documentElement.style.getPropertyValue('--foreground') || '35, 35, 35') + ')';
                context.fillText((this.solarInPowerSum?.toFixed(2) || "-"), 18, -206);
                context.fillText((this.batteryInPower?.toFixed(1) || "-"), 23, 145);
                context.fillText((this.batteryChargeLevel?.toFixed(1) || "-"), 23, 167);
                context.fillText((this.acInPowerSum?.toFixed(2) || "-"), -192, -26);
                context.fillText((this.acOutPowerSum?.toFixed(2) || "-"), 230, -26);
                context.textAlign = "center";
                context.font = "bold 12px Avenir Next, Arial";
                context.fillStyle = 'rgb(' + (document.documentElement.style.getPropertyValue('--accent') || '84, 156, 181') + ')';
                context.fillText(this.acOutPowerIds.length.toString(), 30, 55);
                context.fillText(this.solarInPowerIds.length.toString(), 22, -132);
                for (let i = 0; i < 10; ++i) {
                    if ((i * 10) >= (this.batteryChargeLevel || 0) - 9.999) {
                        context.globalAlpha = 0.4;
                    }
                    context.fillRect(-11, 223.5 - i * 4, 16.5, 2);
                }
                context.globalAlpha = this.props.client.getAccessLevel() >= SIAccessLevel.EXPERT ? 1.0 : 0.5;
                context.strokeStyle = 'rgb(' + (document.documentElement.style.getPropertyValue('--accent') || '84, 156, 181') + ')';
                context.lineWidth = 1;
                context.beginPath();
                const radius = this.inverterOn ? 3.5 : 3;
                context.ellipse(this.inverterOn ? 4.4 : -4.4, 2.6, radius, radius, 0, 0, 2 * Math.PI);
                if (this.inverterOn) context.fill();
                else context.stroke();
                context.globalAlpha = 1.0;
                if (this.props.showDeviceAccess) {
                    context.fillStyle = 'rgb(' + (document.documentElement.style.getPropertyValue('--accent') || '84, 156, 181') + ')';
                    context.font = "bold 18px Avenir Next, Arial";
                    context.textAlign = "right"
                    context.fillText(this.props.deviceAccess?.id || "", 270, 238);
                }
            }
        }
    }

    private onCanvasClicked = (event: React.MouseEvent<HTMLElement>) => {
        const relX = event.nativeEvent.offsetX / this.canvas.current!.clientWidth;
        const relY = event.nativeEvent.offsetY / this.canvas.current!.clientHeight;
        if (relX >= 0.483 && relX <= 0.516 && relY >= 0.498 && relY <= 0.512) {
            if (this.inverterOnId && this.props.client.getAccessLevel() >= SIAccessLevel.EXPERT) {
                this.spinner.current?.show(500);
                if (this.updateTimeoutId) {
                    window.clearTimeout(this.updateTimeoutId);
                }
                this.updateTimeoutId = window.setTimeout(this.update, 250);
                const id = this.inverterOn ? this.inverterOnId.replace(".3049", ".1399") : this.inverterOnId.replace(".3049", ".1415");
                this.props.client.writeProperty(id);
            }
        }
    };

    private toggleFullscreen = () => {
        if (fscreen.fullscreenElement === this.dashboard.current)  {
            fscreen.exitFullscreen();
            this.setState({
                fullscreen: false
            });
        } else {
            fscreen.requestFullscreen(this.dashboard.current!);
            this.setState({
                fullscreen: true
            });
        }
    }

    private update = () => {
        let properties = Array<string>();
        if (this.inverterOnId) properties.push(this.inverterOnId);
        properties = properties.concat(this.solarInPowerIds);
        properties = properties.concat(this.acOutPowerIds);
        if (this.batteryInPowerId) properties.push(this.batteryInPowerId);
        if (this.batteryChargeLevelId) properties.push(this.batteryChargeLevelId);
        properties = properties.concat(this.acInPowerIds);

        if (properties.length > 0) {
            try {
                this.props.client.readProperties(properties);
            } catch (e: unknown) {
            }
        } else {
            this.updateTimeoutId = window.setTimeout(this.update, 250);
        }
    };

    onPropertiesFound(status: SIStatus, id: string, count: number, virtual: boolean, functions: Set<SIDeviceFunctions>, properties: string[]) {
        switch (id) {
            case "*.*.3049":
                switch (properties.length) {
                    case 0:
                        break;

                    case 1:
                        this.inverterOnId = properties[0];
                        break;

                    default:
                        const multicast = properties.find((id) => id.indexOf(".xts.") !== -1);
                        if (multicast) {
                            this.inverterOnId = multicast;
                        } else {
                            this.inverterOnId = properties[0];
                        }
                }
                break;
        }
    }

    onPropertiesRead(results: SIPropertyReadResult[]) {
        this.spinner.current?.hide();

        const inverterOnResult = results.find((result) => result.id === this.inverterOnId);
        if (inverterOnResult) {
            this.inverterOn = inverterOnResult.value;
        }

        this.solarInPowerSum = results
            .filter((result) => result.id.endsWith(".11004") || result.id.endsWith(".15010"))
            .reduce((sum, result) => sum = sum + parseFloat(result.value), 0);

        this.acOutPowerSum = results
            .filter((result) => result.id.endsWith(".3136"))
            .reduce((sum, result) => sum = sum + result.value, 0);

        const batteryInPowerResult = results.find((result) => result.id.endsWith(".7003"));
        if (batteryInPowerResult) {
            this.batteryInPower = +batteryInPowerResult.value;
        }

        const batteryChargeLevelResult = results.find((result) => result.id.endsWith(".7002"));
        if (batteryChargeLevelResult) {
            this.batteryChargeLevel = +batteryChargeLevelResult.value;
        }

        this.acInPowerSum = results
            .filter((result) => result.id.endsWith(".3137"))
            .reduce((sum, result) => sum = sum + result.value, 0);

        this.renderCanvas();

        this.updateTimeoutId = window.setTimeout(this.update, 5000);
    }
}

export default Dashboard;
