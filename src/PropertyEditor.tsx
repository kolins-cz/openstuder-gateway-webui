import React, {createRef} from "react";
import SIGatewayComponent from "./SIGatewayComponent";
import Property from "./Property";
import {DeviceAccessDescription, DeviceDescription, PropertyDescription} from "./Description";
import {SIGatewayClient, SIStatus, SIPropertyReadResult} from "@openstuder/openstuder";
import {ReactComponent as ReadAllIcon} from "./resources/icons/ReadAll.svg";
import {ReactComponent as CollapseIcon} from "./resources/icons/Collapse.svg";
import {ReactComponent as ExpandIcon} from "./resources/icons/Expand.svg";
import Spinner from "./Spinner";
import {toast} from "react-toastify";
import StateStorage from "./StateStorage";

interface PropertyEditorProperties {
    client: SIGatewayClient;
    deviceAccess?: DeviceAccessDescription;
    stateStorage: StateStorage
}

class PropertyEditor extends SIGatewayComponent<PropertyEditorProperties, {}> {
    private properties = new Map<string, Property>();

    private scrollPosY: number = 0;

    private propertyToWrite: Property | null = null;
    private valueToWrite: any;

    private floatInputDialog: HTMLDivElement | null = null;
    private floatInput: HTMLInputElement | null = null;
    private floatInputText: HTMLHeadElement | null = null;
    private floatInputOkButton: HTMLButtonElement | null = null;

    private boolInputDialog: HTMLDivElement | null = null;
    private boolInput: HTMLInputElement | null = null;
    private boolInputText: HTMLHeadElement | null = null;

    private enumInputDialog: HTMLDivElement | null = null;
    private enumInput: HTMLSelectElement | null = null;
    private enumInputText: HTMLHeadElement | null = null;

    private timeOfDayInputDialog: HTMLDivElement | null = null;
    private timeOfDayInput: HTMLInputElement | null = null;
    private timeOfDayInputText: HTMLHeadElement | null = null;

    private daysOfWeekInputDialog: HTMLDivElement | null = null;
    private daysOfWeekInputs: Array<HTMLInputElement | null> = [null, null, null, null, null, null, null];
    private daysOfWeekInputText: HTMLHeadElement | null = null;

    private spinner = createRef<Spinner>();

    public render() {
        return (
            <div className="property-editor">
                {this.renderDeviceAccess(this.props.deviceAccess!)}
                <div ref={(it) => this.floatInputDialog = it} className="modal">
                    <div className="form">
                        <h1 ref={(it) => this.floatInputText = it}>float input</h1>
                        <input ref={(it) => this.floatInput = it} type="text" pattern="[+-]?([0-9]*[.])?[0-9]+" required={true} onChange={(event) => this.floatInputOkButton!.disabled = !event.target.validity.valid}/>
                        <br/>
                        <button ref={(it) => this.floatInputOkButton = it} onClick={this.writeFloatProperty}>Ok</button>
                        <button onClick={this.cancelPropertyWrite}>Cancel</button>
                    </div>
                </div>
                <div ref={(it) => this.boolInputDialog = it} className="modal">
                    <div className="form">
                        <h1 ref={(it) => this.boolInputText = it}>bool input</h1>
                        <label className="switch">
                            <input ref={(it) => this.boolInput = it} type="checkbox"/>
                            <span className="slider"/>
                        </label>
                        <br/>
                        <button onClick={this.writeBoolProperty}>Ok</button>
                        <button onClick={this.cancelPropertyWrite}>Cancel</button>
                    </div>
                </div>
                <div ref={(it) => this.enumInputDialog = it} className="modal">
                    <div className="form">
                        <h1 ref={(it) => this.enumInputText = it}>enum input</h1>
                        <select ref={(it) => this.enumInput = it}>
                        </select>
                        <br/>
                        <button onClick={this.writeEnumProperty}>Ok</button>
                        <button onClick={this.cancelPropertyWrite}>Cancel</button>
                    </div>
                </div>
                <div ref={(it) => this.timeOfDayInputDialog = it} className="modal">
                    <div className="form">
                        <h1 ref={(it) => this.timeOfDayInputText = it}>time input</h1>
                        <input ref={(it) => this.timeOfDayInput = it} type="time"/>
                        <br/>
                        <button onClick={this.writeTimeOfDayProperty}>Ok</button>
                        <button onClick={this.cancelPropertyWrite}>Cancel</button>
                    </div>
                </div>
                <div ref={(it) => this.daysOfWeekInputDialog = it} className="modal">
                    <div className="form">
                        <h1 ref={(it) => this.daysOfWeekInputText = it}>days of week input</h1>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Monday</td>
                                    <td>
                                        <label className="switch small">
                                            <input ref={(it) => this.daysOfWeekInputs[0] = it} type="checkbox"/>
                                            <span className="slider"/>
                                        </label>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Tuesday</td>
                                    <td>
                                        <label className="switch small">
                                            <input ref={(it) => this.daysOfWeekInputs[1] = it} type="checkbox"/>
                                            <span className="slider"/>
                                        </label>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Wednesday</td>
                                    <td>
                                        <label className="switch small">
                                            <input ref={(it) => this.daysOfWeekInputs[2] = it} type="checkbox"/>
                                            <span className="slider"/>
                                        </label>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Thursday</td>
                                    <td>
                                        <label className="switch small">
                                            <input ref={(it) => this.daysOfWeekInputs[3] = it} type="checkbox"/>
                                            <span className="slider"/>
                                        </label>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Friday</td>
                                    <td>
                                        <label className="switch small">
                                            <input ref={(it) => this.daysOfWeekInputs[4] = it} type="checkbox"/>
                                            <span className="slider"/>
                                        </label>
                                    </td>
                                </tr>
                                <tr className="weekday">
                                    <td>Saturday</td>
                                    <td>
                                        <label className="switch small">
                                            <input ref={(it) => this.daysOfWeekInputs[5] = it} type="checkbox"/>
                                            <span className="slider"/>
                                        </label>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Sunday</td>
                                    <td>
                                        <label className="switch small">
                                            <input ref={(it) => this.daysOfWeekInputs[6] = it} type="checkbox"/>
                                            <span className="slider"/>
                                        </label>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <br/>
                        <button onClick={this.writeDaysOfWeekProperty}>Ok</button>
                        <button onClick={this.cancelPropertyWrite}>Cancel</button>
                    </div>
                </div>
                <Spinner ref={this.spinner}/>
            </div>
        )
    }

    private renderDeviceAccess(deviceAccess: DeviceAccessDescription) {
        return (
            <div key={deviceAccess.id} className="device-access" id={deviceAccess.id}>
                <div>
                    {deviceAccess.devices.filter((it) => it.model.indexOf('multicast') === -1).map((it) => this.renderDevice(it, deviceAccess.id))}
                </div>
            </div>
        )
    }

    private renderDevice(device: DeviceDescription, deviceAccessId: string) {
        const id = deviceAccessId + '.' + device.id;
        return (
            <div key={id} className="device" id={id}>
                <header>
                    <span className="id">{device.id}</span>
                    <span className="model">{device.model}</span>
                    <div className="button" onClick={() => this.readAllProperties(device)} title="Read all properties">
                        <ReadAllIcon/>
                    </div>
                    <div className="collapse" onClick={(event) => this.toggleCollapse(event.currentTarget as HTMLDivElement, document.getElementById(id + '-table')! as HTMLTableElement)}>
                        <CollapseIcon className="collapse" style={{display: "none"}}/>
                        <ExpandIcon className="expand" style={{display: "block"}}/>
                    </div>
                </header>
                <table id={id + '-table'} style={{display: "none"}}>
                    <tbody>
                        {device.properties
                            .sort((lhs, rhs) =>
                                lhs.id === rhs.id ? 0 : (lhs.id < rhs.id ? -1 : 1)
                            )
                            .map((it: any) => this.renderProperty(it, deviceAccessId, device.id))}
                    </tbody>
                </table>
            </div>
        )
    }

    private renderProperty(property: PropertyDescription, deviceAccessId: string, deviceId: string) {
        const id = deviceAccessId + '.' + deviceId + '.' + property.id;
        return (
            <Property
                key={id}
                ref={(it) => this.properties.set(id, it!)}
                description={property}
                deviceAccessId={deviceAccessId}
                deviceId={deviceId}
                readProperty={this.readProperty}
                writeProperty={this.writeProperty}
            />
        )
    }

    private readProperty = (property: Property) => {
        property.valueWillBeRead();
        this.props.client.readProperty(property.getId());
    };

    private readAllProperties(device: DeviceDescription) {
        this.spinner.current?.show(300);
        const ids = device.properties
            .filter((property: PropertyDescription) => property.readable)
            .map((property: PropertyDescription) => `${this.props.deviceAccess!.id}.${device.id}.${property.id}`);
        this.props.client.readProperties(ids);
    }

    private writeProperty = (property: Property) => {
        this.propertyToWrite = property;
        switch (property.getDescription().type) {
            case 'Float': {
                this.floatInputText!.innerText = property.getDescription().description;
                this.floatInput!.value = property.getValue();
                this.floatInputDialog!.style.setProperty('display', 'flex');
                this.scrollPosY = window.scrollY;
                this.floatInput?.focus();
                this.floatInput?.select();
                break;
            }

            case 'Bool': {
                this.boolInputText!.innerText = property.getDescription().description;
                const value = property.getValue();
                switch (typeof value) {
                    case 'boolean':
                        this.boolInput!.checked = value as boolean;
                        break;

                    case 'number':
                        this.boolInput!.checked = value as number !== 0;
                        break;

                    case 'string':
                        this.boolInput!.checked = value as string === 'true' || value as string === '1';
                        break;
                }
                this.boolInputDialog!.style.setProperty('display', 'flex');
                this.scrollPosY = window.scrollY;
                break;
            }

            case 'Enum': {
                this.enumInputText!.innerText = property.getDescription().description;
                while ((this.enumInput?.options.length ?? 0) > 0) {
                    this.enumInput?.remove(0);
                }
                this.enumInputDialog!.style.setProperty('display', 'flex');
                Object.keys(property.getDescription().values).forEach((it) => {
                    let element = document.createElement('option');
                    element.innerHTML = it;
                    element.value = property.getDescription().values[it];
                    if (element.value === property.getValue()) {
                        element.selected = true;
                    }
                    this.enumInput?.options.add(element);
                });
                this.scrollPosY = window.scrollY;
                break;
            }

            case 'TimeOfDay': {
                this.timeOfDayInputText!.innerText = property.getDescription().description;
                const value = property.getValue();
                this.timeOfDayInput!.value = value as string;
                this.timeOfDayInputDialog!.style.setProperty('display', 'flex');
                this.scrollPosY = window.scrollY;
                break;
            }

            case 'DaysOfWeek': {
                this.daysOfWeekInputText!.innerText = property.getDescription().description;
                const value = property.getValue();
                if (value) {
                    for (let i = 0; i < 7; ++i) {
                        this.daysOfWeekInputs[i]!.checked = (value & (1 << i)) !== 0;
                    }
                }
                this.daysOfWeekInputDialog!.style.setProperty('display', 'flex');
                this.scrollPosY = window.scrollY;
                break;
            }

            case 'Signal':
                property.valueWillBeWritten();
                this.props.client.writeProperty(property.getId());
                break;
        }
    };

    private writeFloatProperty = () => {
        this.floatInputDialog?.style.setProperty('display', 'none');
        setTimeout(() => window.scrollTo(0, this.scrollPosY), 0);

        if (this.propertyToWrite) {
            this.valueToWrite = this.floatInput?.value;
            if (this.valueToWrite != null) {
                this.propertyToWrite.valueWillBeWritten();
                this.props.client.writeProperty(this.propertyToWrite.getId(), this.valueToWrite);
            }
        }
    };

    private writeBoolProperty = () => {
        this.boolInputDialog?.style.setProperty('display', 'none');
        setTimeout(() => window.scrollTo(0, this.scrollPosY), 0);

        if (this.propertyToWrite) {
            this.valueToWrite = this.boolInput?.checked ? 1 : 0;
            if (this.valueToWrite != null) {
                this.propertyToWrite.valueWillBeWritten();
                this.props.client.writeProperty(this.propertyToWrite.getId(), this.valueToWrite);
            }
        }
    };

    private writeEnumProperty = () => {
        this.enumInputDialog?.style.setProperty('display', 'none');
        setTimeout(() => window.scrollTo(0, this.scrollPosY), 0);

        if (this.propertyToWrite) {
            this.valueToWrite = this.enumInput?.value;
            if (this.valueToWrite != null) {
                this.propertyToWrite.valueWillBeWritten();
                this.props.client.writeProperty(this.propertyToWrite.getId(), this.valueToWrite);
            }
        }
    };

    private writeTimeOfDayProperty = () => {
        this.timeOfDayInputDialog?.style.setProperty('display', 'none');
        setTimeout(() => window.scrollTo(0, this.scrollPosY), 0);

        if (this.propertyToWrite) {
            this.valueToWrite = this.timeOfDayInput?.value;
            if (this.valueToWrite != null) {
                this.propertyToWrite.valueWillBeWritten();
                this.props.client.writeProperty(this.propertyToWrite.getId(), this.valueToWrite);
            }
        }
    };

    private writeDaysOfWeekProperty = () => {
        this.daysOfWeekInputDialog?.style.setProperty('display', 'none');
        setTimeout(() => window.scrollTo(0, this.scrollPosY), 0);

        if (this.propertyToWrite) {
            this.valueToWrite = 0;
            for (let i = 0; i < 7; ++i) {
                if (this.daysOfWeekInputs[i]!.checked) this.valueToWrite += (1 << i);
            }
            if (this.valueToWrite != null) {
                this.propertyToWrite.valueWillBeWritten();
                this.props.client.writeProperty(this.propertyToWrite.getId(), this.valueToWrite);
            }
        }
    };

    private cancelPropertyWrite = () => {
        this.floatInputDialog?.style.setProperty('display', 'none');
        this.enumInputDialog?.style.setProperty('display', 'none');
        this.boolInputDialog?.style.setProperty('display', 'none');
        this.timeOfDayInputDialog?.style.setProperty('display', 'none');
        this.daysOfWeekInputDialog?.style.setProperty('display', 'none');
        setTimeout(() => window.scrollTo(0, this.scrollPosY), 0);
    };

    onPropertyRead(status: SIStatus, propertyId: string, value?: string) {
        const property = this.properties.get(propertyId);
        if (property) {
            if (status === SIStatus.SUCCESS) {
                property.valueWasSuccessfullyRead(value);
            } else {
                property.valueReadError();

                toast.error('Error reading property ' + propertyId);
            }
        }
    }

    onPropertiesRead(results: SIPropertyReadResult[]) {
        this.spinner.current?.hide();
        results.forEach((result) => {
            this.onPropertyRead(result.status, result.id, result.value?.toString());
        });
    }

    onPropertyWritten(status: SIStatus, propertyId: string) {
        if (this.propertyToWrite && this.propertyToWrite.getId() === propertyId) {
            if (status === SIStatus.SUCCESS) {
                this.propertyToWrite.valueWasSuccessfullyWritten(this.valueToWrite);
            } else {
                this.propertyToWrite.valueWriteError();
                alert('Error writing property ' + propertyId);
            }
        } else {
            alert('unknown error');
            this.propertyToWrite = null;
        }
    }

    private toggleCollapse(control: HTMLDivElement, target: HTMLTableElement) {
        const collapse = target.style.display !== 'none';
        target.style.setProperty('display', collapse ? 'none' : 'table');
        (control.querySelector(".expand")! as SVGElement).style.display = collapse ? "block" : "none";
        (control.querySelector(".collapse")! as SVGElement).style.display = !collapse ? "block" : "none";
    }
}

export default PropertyEditor;
