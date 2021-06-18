import React, {createRef} from "react";
import {SIAccessLevel, SIGatewayClient} from "@openstuder/openstuder";
import SIGatewayComponent from "./SIGatewayComponent";
import logo from './resources/images/OpenStuder.svg'
import ThemeChooser from "./ThemeChooser";

interface LoginProperties {
    host: string
    port: number
    client: SIGatewayClient
}

class Login extends SIGatewayComponent<LoginProperties, {}> {
    static defaultProps = {
        host: window.location.hostname,
        port: 1987
    };

    private box = createRef<HTMLDivElement>();
    private username = createRef<HTMLInputElement>();
    private password = createRef<HTMLInputElement>();
    private button = createRef<HTMLButtonElement>();

    render() {
        return (
            <div className="login">
                <div>
                    <div ref={this.box} className="box">
                        <img src={logo} alt="logo"/>
                        <label>THEME</label>
                        <ThemeChooser/>
                        <label>USERNAME</label>
                        <input ref={this.username} type="text" placeholder="guest"/>
                        <label>PASSWORD</label>
                        <input ref={this.password} type="password" placeholder="guest" onKeyPress={(event) => {
                            if (event.key === 'Enter') this.login();
                        }}/>
                        <button ref={this.button} onClick={this.login}>Login</button>
                    </div>
                </div>
            </div>
        );
    }

    private login = () => {
        this.username.current!.disabled = true;
        this.password.current!.disabled = true;
        this.button.current!.disabled = true;

        let host = this.props.host;
        if (!host.startsWith('ws://')) {
            host = 'ws://' + host;
        }

        this.props.client.connect(host, this.props.port, this.username.current?.value, this.password.current?.value);
    };

    onError(reason: string) {
        this.box.current?.classList.add('shake');
        setTimeout(() => {
            this.box.current!.classList.remove('shake');
            this.username.current!.disabled = false;
            this.password.current!.disabled = false;
            this.password.current!.select();
            this.button.current!.disabled = false;
        }, 500);
    }
}

export default Login;
