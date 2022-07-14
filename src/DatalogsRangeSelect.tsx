import React from 'react'
import {ReactComponent as TimeRangeIcon} from "./resources/icons/Timerange.svg";
import {ReactComponent as RefreshIcon} from "./resources/icons/Referesh.svg";

interface DatalogsRangeSelectProperties {
    onRangeChanged: (from: Date, to: Date | string) => void,
    from: Date,
    to: Date | string
}

class DatalogsRangeSelectState {
    constructor(from: Date, to: Date | string) {
        this.from = from;
        this.to = to;
        this.expanded = false;
    }

    from: Date;
    to: Date | string;
    expanded: boolean;
}

class DatalogsRangeSelect extends React.Component<DatalogsRangeSelectProperties, DatalogsRangeSelectState> {
    private rangeSelect: HTMLDivElement | null = null;

    private fromDate: HTMLInputElement | null = null;
    private fromTime: HTMLInputElement | null = null;
    private toDate: HTMLInputElement | null = null;
    private toTime: HTMLInputElement | null = null;

    private toAsDate(): Date {
        if (this.state.to instanceof Date) {
            return this.state.to;
        } else {
            return new Date();
        }
    }

    private fromAsString(): string {
        return this.state.from.getHours() === 0 && this.state.from.getMinutes() === 0 ? this.state.from.toLocaleDateString() : this.state.from.toLocaleDateString() + ' ' + this.state.from.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    private toAsString(): string {
        if (this.state.to instanceof Date) {
            return this.state.to.getHours() === 0 && this.state.to.getMinutes() === 0 ? this.state.to.toLocaleDateString() : this.state.to.toLocaleDateString() + ' ' + this.state.to.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return this.state.to;
        }
    }

    constructor(props: DatalogsRangeSelectProperties) {
        super(props);

        let to = props.to

        let from = props.from

        this.state = new DatalogsRangeSelectState(from, to);
    }

    public render() {
        return (
            <div className="time-range">
                <div className={this.state.expanded ? "expanded" : "summary"}>
                    <div onClick={() => this.toggleExpanded()}>
                    <TimeRangeIcon/>
                    <div>{this.fromAsString()}</div>
                    <div>-</div>
                    <div>{this.toAsString()}</div>
                    </div>
                    <RefreshIcon className={this.state.to instanceof Date ? "disabled" : ""} onClick={() => {
                        if (!(this.state.to instanceof Date)) {
                            this.toDate!.value = this.toAsDate().toISOString().split('T')[0]
                            this.toTime!.value = this.toAsDate().toLocaleTimeString()
                            this.props.onRangeChanged(this.state.from, this.state.to);
                        }
                    }}/>
                </div>
                <div ref={(it) => this.rangeSelect = it} className="select" style={{'display': this.state.expanded ? 'block' : 'none'}}>
                    <label>From:</label>
                    <div className="input">
                        <input type="date" ref={(it) => this.fromDate = it} defaultValue={this.state.from.toISOString().split('T')[0]}/>
                        <input type="time" ref={(it) => this.fromTime = it} defaultValue={this.state.from.toLocaleTimeString()}/>
                    </div>
                    <label>To:</label>
                    <div className="input">
                        <input type="date" ref={(it) => this.toDate = it} defaultValue={this.toAsDate().toISOString().split('T')[0]}/>
                        <input type="time" ref={(it) => this.toTime = it} defaultValue={this.toAsDate().toLocaleTimeString()}/>
                    </div>
                    <button onClick={() => this.onCustomRangeApplied()}>Apply</button>
                    <hr/>
                    <button className="interval" onClick={() => this.onQuickRangeClicked('today')}>Today</button>
                    <button className="interval" onClick={() => this.onQuickRangeClicked('yesterday')}>Yesterday</button>
                    <button className="interval" onClick={() => this.onQuickRangeClicked('this_week')}>This week</button>
                    <button className="interval" onClick={() => this.onQuickRangeClicked('last_week')}>Last week</button>
                    <button className="interval" onClick={() => this.onQuickRangeClicked('this_month')}>This month</button>
                    <button className="interval" onClick={() => this.onQuickRangeClicked('last_month')}>Last month</button>
                    <button className="interval" onClick={() => this.onQuickRangeClicked('this_year')}>This year</button>
                    <button className="interval" onClick={() => this.onQuickRangeClicked('last_year')}>Last year</button>
                    <button className="interval" onClick={() => this.onQuickRangeClicked('last_60_minutes')}>Last 60 minutes</button>
                    <button className="interval" onClick={() => this.onQuickRangeClicked('last_24_hours')}>Last 24 hours</button>
                </div>
            </div>
        );
    }

    private toggleExpanded() {
        const expanded = !this.state.expanded;
        if (expanded) {
            this.fromDate!.value = this.state.from.toISOString().split('T')[0];
            this.fromTime!.value = this.state.from.toLocaleTimeString();
            this.toDate!.value = this.toAsDate().toISOString().split('T')[0];
            this.toTime!.value = this.toAsDate().toLocaleTimeString();
        }
        this.setState({expanded: expanded})
    }

    private onCustomRangeApplied() {
        const from = new Date('' + this.fromDate?.value + 'T' + this.fromTime?.value);
        const to = new Date('' + this.toDate?.value + 'T' + this.toTime?.value);
        this.setState({
            from: from,
            to: to,
            expanded: false
        });
        this.props.onRangeChanged(from, to);
    }

    private onQuickRangeClicked(range: string) {
        let from = new Date();
        from.setMilliseconds(0);
        from.setSeconds(0);

        let to: Date | string = new Date();
        to.setMilliseconds(0);
        to.setSeconds(0);

        switch (range) {
            case 'today':
                from.setMinutes(0);
                from.setHours(0);
                to = 'now';
                break;

            case 'yesterday':
                to.setMinutes(0);
                to.setHours(0);
                from.setTime(to.getTime() - 24 * 60 * 60 * 1000);
                break;

            case 'this_week':
                from.setMinutes(0);
                from.setHours(0);
                from.setTime(from.getTime() - (from.getDay() - 1) * 24 * 60 * 60 * 1000);
                to = 'now';
                break;

            case 'last_week':
                to.setMinutes(0);
                to.setHours(0);
                to.setTime(to.getTime() - (to.getDay() - 1) * 24 * 60 * 60 * 1000);
                from.setTime(to.getTime() - 7 * 24 * 60 * 60  * 1000);
                break;

            case 'this_month':
                from.setMinutes(0);
                from.setHours(0);
                from.setTime(from.getTime() - (from.getDate() - 1) * 24 * 60 * 60 * 1000);
                to = 'now';
                break;

            case 'last_month':
                to.setMinutes(0);
                to.setHours(0);
                to.setTime(to.getTime() - (to.getDate() - 1) * 24 * 60 * 60 * 1000);
                from.setTime(to.getTime());
                from.setMonth(from.getMonth() - 1);
                break;

            case 'this_year':
                from.setMinutes(0);
                from.setHours(0);
                from.setMonth(0, 1);
                to = 'now';
                break;

            case 'last_year':
                to.setMinutes(0);
                to.setHours(0);
                to.setMonth(0, 1);
                from.setTime(to.getTime());
                from.setFullYear(from.getFullYear() - 1);
                break;

            case 'last_60_minutes':
                from.setTime(to.getTime() - 60 * 60 * 1000);
                to = 'now';
                break;

            case 'last_24_hours':
                from.setTime(to.getTime() - 24 * 60 * 60 * 1000);
                to = 'now';
                break;
        }
        this.setState({
            from: from,
            to: to,
            expanded: false
        });
        this.props.onRangeChanged(from, to);
    }
}

export default DatalogsRangeSelect;