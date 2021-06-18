import React from "react";
import {ReactComponent as SpinnerAnimation} from "./resources/images/Spinner.svg"

interface SpinnerProperties {
    className: string
    initialVisible: boolean
}

class SpinnerState {
    public visible: boolean;

    constructor(initialVisible: boolean) {
        this.visible = initialVisible;
    }
}

class Spinner extends React.Component<SpinnerProperties, SpinnerState> {
    static defaultProps = {
        className: "spinner",
        initialVisible: false
    };

    private timeoutID: number | undefined = undefined;

    constructor(props: SpinnerProperties) {
        super(props);
        this.state = new SpinnerState(props.initialVisible);
    }

    render() {
        return (
            <div className={this.state.visible ? this.props.className : "hidden"}>
                <SpinnerAnimation/>
            </div>
        )
    }

    public show(delayMS: number = 0) {
        if (delayMS == 0) {
            this.setState({
                visible: true
            });
        } else {
            if (this.timeoutID) {
                window.clearTimeout(this.timeoutID);
            }
            this.timeoutID = window.setTimeout(() => this.setState({visible: true}), delayMS);
        }
    }

    public hide() {
        if (this.timeoutID) {
            window.clearTimeout(this.timeoutID);
            this.timeoutID = undefined;
        }
        this.setState({
            visible: false
        });
    }
}

export default Spinner;
