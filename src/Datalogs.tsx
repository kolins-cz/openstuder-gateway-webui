import React from 'react'
import SIGatewayComponent from "./SIGatewayComponent";
import {SIGatewayClient, SIStatus} from "@openstuder/openstuder";
import DatalogsRangeSelect from "./DatalogsRangeSelect";
import Chart, {ChartProperty} from "./Chart";
import {DeviceAccessDescription, findPropertyDescription} from "./Description";
import AddIcon from "./resources/icons/Add.svg";

interface DatalogsProperties {
    client: SIGatewayClient
    deviceAccess: DeviceAccessDescription | undefined
}

type DatalogsChart = {
    id: string
    isNew: boolean
    ref: Chart | null
    series: Array<ChartProperty>
}

class DatalogsState {
    constructor(from: Date, to: Date, properties: Array<string>, charts: Array<DatalogsChart>) {
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
    private propertiesSelector: HTMLDivElement | null = null;

    constructor(props: DatalogsProperties) {
        super(props);

        let to = new Date();
        to.setSeconds(0);
        to.setMilliseconds(0);

        let from = new Date();
        from.setTime(to.getTime() - 24 * 60 * 60 * 1000);

        let charts = new Array<DatalogsChart>();
        const currentChartsJson = localStorage.getItem(`charts-${this.props.deviceAccess?.id}`);
        if (currentChartsJson) {
            const currentCharts = JSON.parse(currentChartsJson) as Array<{series: Array<ChartProperty>}>;
            charts = currentCharts.map((it, i) => ({
                id: 'chart' + i,
                isNew: true,
                ref: null,
                series: it.series
            }));
        }

        this.state = new DatalogsState(from, to, [], charts);
    }

    public componentDidMount() {
        this.props.client.readDatalogProperties();
        this.state.charts.forEach((it) => it.ref?.setRange(this.state.from, this.state.to));
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
                    <Chart key={chart.id} id={chart.id} className="chart" ref={(it) => chart.ref = it} series={chart.series} onClose={() => this.removeChart(chart.id)}/>
                ))}
                <div className="add">
                    <div ref={(it) => this.propertiesSelector = it} className="properties">
                        {this.state.properties.map((property) => (
                                <div key={property}>
                                    <input type="checkbox" title={property}/>
                                    <label htmlFor={property}>{this.resolvePropertyDescription(property)}</label>
                                </div>
                            )
                        )}
                    </div>
                    <img src={AddIcon} alt="add" onClick={this.addChart}/>
                </div>
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
        localStorage.setItem(`charts-${this.props.deviceAccess?.id}`, JSON.stringify(charts.map((it) => ({
            series: it.series
        }))));
        this.setState({
            charts: charts
        });
    }

    private addChart = () => {
        const properties = Array.from(this.propertiesSelector?.getElementsByTagName('input') as HTMLCollectionOf<HTMLInputElement>).filter((it) => it.checked);
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
        localStorage.setItem(`charts-${this.props.deviceAccess?.id}`, JSON.stringify(charts.map((it) => ({
            series: it.series
        }))));
        this.setState({
            charts: charts
        });
    };

    private updateData(charts: Array<DatalogsChart>) {
        let properties = new Set<string>();
        charts.forEach((chart) => chart.series.forEach((it) => properties.add(it.property)));
        properties.forEach((it) => this.props.client.readDatalog(it, this.state.from, this.state.to));
    }
}

export default Datalogs;
