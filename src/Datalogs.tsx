import React from 'react'
import SIGatewayComponent from "./SIGatewayComponent";
import {
    SIGatewayClient,
    SIStatus
} from "@openstuder/openstuder";
import DatalogsRangeSelect from "./DatalogsRangeSelect";
import Chart, {ChartProperty} from "./Chart";
import {DeviceAccessDescription, findPropertyDescription} from "./Description";
import AddIcon from "./resources/icons/AddDatalog.svg";
import StateStorage from "./StateStorage";
import Spinner from "./Spinner";

interface DatalogsProperties {
    client: SIGatewayClient
    deviceAccess: DeviceAccessDescription | undefined,
    stateStorage: StateStorage
}

type DatalogsChart = {
    id: string
    isNew: boolean
    ref: Chart | null
    series: Array<ChartProperty>
}

class DatalogsState {
    constructor(from: Date, to: Date, properties: Array<string> = [], charts: Array<DatalogsChart> = []) {
        this.from = from;
        this.to = to;
        this.properties = properties;
        this.charts = charts;
    }

    from: Date;
    to: Date;
    properties: Array<string>;
    charts: Array<DatalogsChart>;
}

class Datalogs extends SIGatewayComponent<DatalogsProperties, DatalogsState> {
    private addChartDialog: HTMLDivElement | null = null;
    private selectedProperties: HTMLDivElement | null = null;
    private spinner: Spinner | null = null;
    private loadingProperties = new Set<string>();

    constructor(props: DatalogsProperties) {
        super(props);

        let to = new Date();
        to.setSeconds(0);
        to.setMilliseconds(0);

        let from = new Date();
        from.setTime(to.getTime() - 24 * 60 * 60 * 1000);

        this.state = new DatalogsState(from, to);
    }

    public componentDidMount() {
        this.setState(this.props.stateStorage.getState<DatalogsState>("datalogs", () => {
            this.props.client.readDatalogProperties();
            return this.state
        }));
    }

    public componentDidUpdate(prevProps: Readonly<DatalogsProperties>, prevState: Readonly<DatalogsState>, snapshot?: any) {
        if (prevState.from !== this.state.from && prevState.to !== this.state.to) {
            this.state.charts.forEach((it) => it.ref?.setRange(this.state.from, this.state.to));
            this.updateData(this.state.charts);
        } else {
            const newCharts = this.state.charts.filter((it) => it.isNew);
            newCharts.forEach((it) => {
                it.ref?.setRange(this.state.from, this.state.to);
                it.isNew = false;
            });
            this.updateData(newCharts);
        }
    }


    componentWillUnmount() {
        this.props.stateStorage.saveState<DatalogsState>("datalogs", this.state);
    }

    public render() {
        return (
            <div className="datalogs">
                <DatalogsRangeSelect onRangeChanged={(from, to) => {
                    this.setState({
                        from: from,
                        to: to
                    });
                }}/>
                {this.state.charts.map((chart) => (
                    <Chart key={chart.id} id={chart.id} className="chart" ref={(it) => chart.ref = it}
                           series={chart.series} onClose={() => this.removeChart(chart.id)}/>
                ))}
                <img src={AddIcon} alt="add" onClick={this.showAddChartDialog}/>
                <div ref={(it) => this.addChartDialog = it} className="modal">
                    <div ref={(it) => this.selectedProperties = it} className="form">
                        {this.state.properties.map((property) => (
                                <div key={property}>
                                    <input type="checkbox" title={property}/>
                                    <label htmlFor={property}>{this.resolvePropertyDescription(property)}</label>
                                </div>
                            )
                        )}
                        <br/>
                        <button onClick={this.addChart}>Ok</button>
                        <button onClick={this.cancelAddChart}>Cancel</button>
                    </div>
                </div>
                <Spinner ref={(it) => this.spinner = it}/>
            </div>
        );
    }

    onDatalogPropertiesRead(status: SIStatus, properties: string[]) {
        if (status === SIStatus.SUCCESS) {
            this.setState({
                properties: properties.filter((it) => it.startsWith(this.props.deviceAccess?.id + '.'))
            })
        }
        this.updateData(this.state.charts);
    }

    onDatalogRead(status: SIStatus, propertyId: string, count: number, values: string) {
        this.loadingProperties.delete(propertyId);
        if (this.loadingProperties.size === 0) {
            this.spinner?.hide();
        }
        if (status === SIStatus.SUCCESS) {
            const data = values.split('\n').map((it) => {
                const components = it.split(',');
                return [Date.parse(components[0]), parseFloat(components[1])];
            });
            this.state.charts.forEach((chart) => {
                if (chart.series.find((it) => it.property === propertyId)) {
                    chart.ref?.updateData(propertyId, data);
                }
            })
        }
    }

    private resolvePropertyDescription(propertyId: string): string {
        if (!this.props.deviceAccess) return propertyId + "- (no info)";
        const [device, property] = findPropertyDescription(this.props.deviceAccess, propertyId);
        if (!device || !property) return propertyId + "- (no info)";
        return `${propertyId} - ${device.model}: ${property.description}` + (property.unit ? `[${property.unit}]` : "");
    }

    private removeChart(id: string) {
        const charts = this.state.charts.filter((it) => it.id !== id);
        this.setState({
            charts: charts
        });
    }

    private showAddChartDialog = () => {
        this.addChartDialog?.style.setProperty('display', 'flex');
    }

    private addChart = () => {
        this.addChartDialog?.style.setProperty('display', 'none');

        const properties = Array.from(this.selectedProperties?.getElementsByTagName('input') as HTMLCollectionOf<HTMLInputElement>).filter((it) => it.checked);
        if (properties.length === 0) return;

        let charts = this.state.charts;
        charts.push({
            id: new Date().getTime().toString(),
            isNew: true,
            ref: null,
            series: properties.map((it) => ({
                property: it.title,
                description: this.resolvePropertyDescription(it.title)
            })),
        });
        properties.forEach((it) => it.checked = false);
        this.setState({
            charts: charts
        });
    };

    private cancelAddChart = () => {
        this.addChartDialog?.style.setProperty('display', 'none');
    }

    private updateData(charts: Array<DatalogsChart>) {
        charts.forEach((chart) => chart.series.forEach((it) => this.loadingProperties.add(it.property)));

        if (this.loadingProperties.size > 0) {
            this.spinner?.show(1000);
        }

        this.loadingProperties.forEach((it) => this.props.client.readDatalog(it, this.state.from, this.state.to));
    }
}

export default Datalogs;
