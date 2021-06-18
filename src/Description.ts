export type PropertyDescription = {
    id: string,
    type: string,
    readable: boolean,
    writeable: boolean,
    description: string,
    values: any,
    unit: string
}

export type DeviceDescription = {
    id: string,
    model: string,
    properties: Array<PropertyDescription>
}

export type DeviceAccessDescription = {
    id: string,
    driver: string,
    parameters: Map<string, any>
    devices: Array<DeviceDescription>
}

export type GatewayDescription = {
    instances: Array<DeviceAccessDescription>
}
