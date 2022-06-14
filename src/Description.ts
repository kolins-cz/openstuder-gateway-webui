export type PropertyDescription = {
    id: number,
    type: string,
    readable: boolean,
    writeable: boolean,
    description: string,
    unit: string
    values: any,
}

export type DeviceDescription = {
    id: string,
    model: string,
    virtual: boolean,
    properties: Array<PropertyDescription>
}

export type DeviceAccessDescription = {
    id: string,
    driver: string,
    parameters: Map<string, any>
    devices: Array<DeviceDescription>
}

export type GatewayDescription = {
    instances: Array<DeviceAccessDescription>,
    drivers: any | undefined
}

export function findPropertiesIds(deviceAccess: DeviceAccessDescription, devicePredicate: (device: DeviceDescription) => boolean, propertyPredicate: (property: PropertyDescription) => boolean): Array<string> {
    let properties = new Array<string>();
    deviceAccess.devices
        .filter(devicePredicate)
        .forEach((device: DeviceDescription) => device.properties
            .filter(propertyPredicate)
            .forEach((property: PropertyDescription) => {
                properties.push(`${deviceAccess.id}.${device.id}.${property.id}`)
            }));
    return properties;
}

export function findPropertyDescription(deviceAccess: DeviceAccessDescription, propertyId: string): [DeviceDescription | undefined, PropertyDescription | undefined] {
    const components = propertyId.split('.');
    if (components.length === 3 && deviceAccess.id === components[0]) {
        const device = deviceAccess.devices.find((device: DeviceDescription) => device.id === components[1]);
        if (device) {
            const property = device.properties.find((property: PropertyDescription) => property.id === parseInt(components[2]));
            if (property) {
                return [device, property]
            }
        }
    }

    return [undefined, undefined];
}