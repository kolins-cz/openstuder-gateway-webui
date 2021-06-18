import React from "react";
import {PropertyDescription} from "./Description";
import {ReactComponent as FloatIcon} from "./resources/icons/Float.svg"
import {ReactComponent as EnumIcon} from "./resources/icons/Enum.svg"
import {ReactComponent as BoolIcon} from "./resources/icons/Bool.svg"
import {ReactComponent as TimeIcon} from "./resources/icons/Time.svg"
import {ReactComponent as DaysOfWeekIcon} from "./resources/icons/DaysOfWeek.svg"
import {ReactComponent as SignalIcon} from "./resources/icons/Signal.svg"
import {ReactComponent as ReadIcon} from "./resources/icons/Read.svg"
import {ReactComponent as WriteIcon} from "./resources/icons/Write.svg"

interface PropertyProperties {
    deviceAccessId: string;
    deviceId: string;
    description: PropertyDescription;
    readProperty: (property: Property) => void
    writeProperty: (property: Property) => void
}

class PropertyState {
    readInProgress: boolean = false;
    writeInProgress: boolean = false;
    value: any = null;
}

class Property extends React.Component<PropertyProperties, PropertyState> {

    private readonly id: string;

    public constructor(props: PropertyProperties) {
        super(props);
        this.state = new PropertyState();
        this.id = props.deviceAccessId + '.' + props.deviceId + '.' + props.description.id;
    }

    public render() {
        let icon = <FloatIcon/>;
        switch (this.props.description.type) {
            case 'Enum':
                icon = <EnumIcon/>;
                break;

            case 'Bool':
                icon = <BoolIcon/>;
                break;

            case 'TimeOfDay':
                icon = <TimeIcon/>;
                break;

            case 'DaysOfWeek':
                icon = <DaysOfWeekIcon/>;
                break;

            case 'Signal':
                icon = <SignalIcon/>;
                break;
        }
        return (
            <tr className="property" id={this.id}>
                <td className="type" title={this.props.description.type}>{icon}</td>
                <td className="id">{this.props.description.id}</td>
                <td className="description">{this.props.description.description}</td>
                <td className={this.state.value != null ? 'value' : 'value null'}>{this.renderValue()}</td>
                <td className="actions">
                    {this.props.description.readable &&
                    <button disabled={!this.props.description.readable || this.state.readInProgress} onClick={() => this.props.readProperty(this)}><ReadIcon/></button>
                    }
                    {this.props.description.writeable &&
                    <button disabled={(this.props.description.type != 'Signal' && this.state.value == null) || this.state.writeInProgress} onClick={() => this.props.writeProperty(this)}><WriteIcon/></button>
                    }
                </td>
            </tr>
        )
    }

    public getId(): string {
        return this.id;
    }

    public getDescription(): PropertyDescription {
        return this.props.description;
    }

    public getValue(): any {
        return this.state.value;
    }

    public valueWillBeRead() {
        this.setState({
            readInProgress: true
        });
    }

    public valueWasSuccessfullyRead(value: any) {
        this.setState({
            readInProgress: false,
            value: value
        });
    }

    public valueReadError() {
        this.setState({
            readInProgress: false,
        });
    }

    public valueWillBeWritten() {
        this.setState({
            writeInProgress: true
        });
    }

    public valueWasSuccessfullyWritten(value: any) {
        this.setState({
            value: value,
            writeInProgress: false
        });
    }

    public valueWriteError() {
        this.setState({
            writeInProgress: false
        });
    }

    private renderValue(): string {
        switch (this.props.description.type) {
            case 'Float':
                return (this.formatFloatValue(this.state.value) ?? '-') + ' ' + this.props.description.unit;

            case 'Enum': {
                if (this.state.value) {
                    let text: string | null = null;
                    for (let key of Object.keys(this.props.description.values)) {
                        if (this.props.description.values[key] === parseInt(this.state.value)) {
                            text = key;
                        }
                    }
                    if (text) {
                        return text;
                    } else {
                        return this.state.value ?? '-';
                    }
                } else {
                    return '-';
                }
            }

            case 'Bool':
                switch (this.state.value) {
                    case 0:
                    case '0':
                        return 'No';

                    case 1:
                    case '1':
                        return 'Yes';

                    default:
                        return '-';
                }

            case 'TimeOfDay':
                if (this.state.value != null) {
                    return this.state.value.substring(0, 5);
                } else {
                    return '-';
                }

            case 'DaysOfWeek': {
                if (this.state.value != null) {
                    let values = new Array<string>();
                    if ((this.state.value & 1) != 0) values.push('Mo');
                    if ((this.state.value & 2) != 0) values.push('Tu');
                    if ((this.state.value & 4) != 0) values.push('We');
                    if ((this.state.value & 8) != 0) values.push('Th');
                    if ((this.state.value & 16) != 0) values.push('Fr');
                    if ((this.state.value & 32) != 0) values.push('Sa');
                    if ((this.state.value & 32) != 0) values.push('Su');
                    if (values.length === 0) {
                        return 'never';
                    } else {
                        return values.join(' | ');
                    }
                } else {
                    return '-';
                }
            }

            case 'Signal':
                return '';
        }
        return '?';
    }

    private formatFloatValue(value?: number, maxDigits?: number, maxDecimals?: number): string | null {
        if (!value) return null;
        let stringValue = '' + value;
        let digitCount = stringValue.length;
        const pointIndex = stringValue.indexOf('.');
        if (pointIndex == -1) {
            return stringValue;
        }
        digitCount -= 1;
        if (digitCount <= (maxDigits ?? 5)) {
            while (stringValue.endsWith('0')) {
                stringValue = stringValue.substring(0, stringValue.length - 2);
            }
            return stringValue;
        }
        let cutAt = Math.max((maxDigits ?? 5) + 1, pointIndex);
        if (maxDecimals) {
            if (maxDecimals == 0) {
                cutAt = Math.min(cutAt, pointIndex);
            } else {
                cutAt = Math.min(cutAt, pointIndex + maxDecimals + 1);
            }
        }
        stringValue = stringValue.substring(0, cutAt);
        while (stringValue.endsWith('0')) {
            stringValue = stringValue.substring(0, stringValue.length - 2);
        }
        return stringValue;
    }
}

export default Property;
