import * as React from 'react';
import * as Highcharts from 'highcharts';
import {Chart as ChartObject} from 'highcharts';

// noinspection TsLint
const Boost = require('highcharts/modules/boost');
Boost(Highcharts); // WebGL-backed rendering (https://www.highcharts.com/blog/tutorials/higcharts-boost-module/)

const lineColors = [
    '84, 156, 181',
    '161, 171, 116',
    '190, 104, 158',
    '0, 143, 180',
    '244, 121, 32',
    '97, 187, 50'
];

export type ChartProperty = {
    property: string,
    description: string
}

interface ChartProperties {
    className: string;
    id: string;
    series: Array<ChartProperty>;
    onClose: () => void | undefined
}

class Chart extends React.Component<ChartProperties, {}> {
    public static defaultProps = {
        className: '',
        series: [],
        onClose: undefined
    };

    private chart: ChartObject | undefined;

    public componentDidMount() {
        Highcharts.setOptions({
            chart: {
                backgroundColor: 'transparent'
            }
        });
        this.chart = Highcharts.chart(this.props.id, {
            title: undefined,
            time: {
                useUTC: false
            },
            chart: {
                marginTop: 48
            },
            credits: {
                enabled: false
            },
            xAxis: {
                type: 'datetime',
                lineColor: 'rgb(var(--foreground))',
                tickColor: 'rgb(var(--foreground))',
                labels: {
                    style: {
                        color: 'rgb(var(--foreground))'
                    }
                }
            },
            yAxis: {
                title: undefined,
                min: 0,
                minRange: 0.01,
                lineWidth: 1,
                lineColor: 'rgb(var(--foreground))',
                gridLineColor: 'rgba(var(--foreground),0.25)',
                labels: {
                    style: {
                        color: 'rgb(var(--foreground))'
                    }
                }
            },
            legend: {
                labelFormat: '{options.description}',
                itemStyle: {
                    color: 'rgb(var(--foreground))'
                },
                itemHoverStyle: {
                    color: 'rgb(var(--accent))'
                },
                enabled: true
            },
            plotOptions: {
                line: {
                    lineWidth: 3,
                    marker: {
                        enabled: false
                    }
                }
            },
            tooltip: {
                style: {
                    color: 'rgb(var(--foreground))'
                },
                backgroundColor: 'rgb(var(--background))'
            },
            series: this.props.series.map((it, i) => ({
                type: 'line',
                color: 'rgb(' + lineColors[i % lineColors.length] + ')',
                name: it.property,
                description: it.description,
                data: []
            }))
        }, (chart) => {
            chart.renderer.button('&nbsp;x&nbsp;',chart.chartWidth - 35, 0, () => {if (this.props.onClose) this.props.onClose()}, {
                style: {
                    color: 'rgb(var(--accent))'
                },
                fill: 'rgb(var(--background))',
                stroke: 'rgb(var(--accent))',
                zIndex: 200
            }, {
                style: {
                    color: 'rgb(var(--background))'
                },
                fill: 'rgb(var(--accent))'
            }, undefined, undefined, "circle", true).add();
        });
    }

    public render() {
        return (
            <div className={this.props.className} id={this.props.id}/>
        );
    }

    public setRange(from: Date, to: Date) {
        this.chart!.xAxis[0].setExtremes(from.getTime(), to.getTime());
    }

    public updateData(name: string, data: Array<Array<number>>) {
        const series = this.chart?.series.find((it) => it.name === name);
        if (series) {
            series.setData(data);
        }
    }
}

export default Chart;
