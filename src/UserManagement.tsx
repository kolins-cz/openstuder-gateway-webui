import SIGatewayComponent from "./SIGatewayComponent";
import {SIExtensionStatus, SIGatewayClient} from "@openstuder/openstuder";
import React from "react";
import {ReactComponent as AccessLevelIcon} from "./resources/icons/AccessLevel.svg"
import {ReactComponent as PasswordIcon} from "./resources/icons/Password.svg"
import {ReactComponent as DeleteIcon} from "./resources/icons/Delete.svg"
import {ReactComponent as AddIcon} from "./resources/icons/Add.svg";
import ToastHelper from "./ToastHelper";


interface UserManagementProperties {
    client: SIGatewayClient
}

class UserManagementState {
    users = new Map<string, string>();
}

class UserManagement extends SIGatewayComponent<UserManagementProperties, UserManagementState> {

    private createUserDialog: HTMLDivElement | null = null;
    private createUserName: HTMLInputElement | null = null;
    private createUserPassword : HTMLInputElement | null = null;
    private createUserAccessLevel: HTMLSelectElement  | null = null;

    private changePasswordDialog: HTMLDivElement | null = null;
    private changePasswordUser: HTMLSpanElement | null = null;
    private changePasswordValue : HTMLInputElement | null = null;

    private changeAccessLevelDialog: HTMLDivElement | null = null;
    private changeAccessLevelUser: HTMLSpanElement | null = null;
    private changeAccessLevelValue : HTMLSelectElement | null = null;

    constructor(props: UserManagementProperties) {
        super(props);
        this.state = new UserManagementState();
    }

    componentDidMount() {
        this.updateUserList();
    }

    render() {
        return <div className="user-management">
            <div className="user-list">
                <table>
                    <thead>
                    <tr>
                        <th>Username</th>
                        <th>Access level</th>
                        <th>
                        <div className="button" title="Add new user" onClick={this.showNewUserDialog}>
                            <AddIcon/>
                        </div></th>

                    </tr>
                    </thead>
                    <tbody>
                    {Array.from(this.state.users).map((user,) => (
                        <tr key={user[0]}>
                            <td className="username">{user[0]}</td>
                            <td className="access-level">{user[1]}</td>
                            <td>
                                <button onClick={() => this.deleteUser(user[0])}><DeleteIcon/></button>
                                <button onClick={() => this.showChangePasswordDialog(user[0])}><PasswordIcon/></button>
                                <button onClick={() => this.showChangeAccessLevelDialog(user[0], user[1])}><AccessLevelIcon/></button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div ref={(it) => this.createUserDialog = it} className="modal">
                <div className="form">
                    <h1>Add new user</h1>
                    <label>Username:</label>
                    <input ref={(it) => this.createUserName = it} type="text" required={true}/><br/>
                    <label>Password:</label>
                    <input ref={(it) => this.createUserPassword = it} type="text" required={true}/><br/>
                    <label>Access level:</label>
                    <select ref={(it) => this.createUserAccessLevel = it} required={true}>
                        <option value="Basic">Basic</option>
                        <option value="Installer">Installer</option>
                        <option value="Expert">Expert</option>
                        <option value="QSP">Qualified service personnel</option>
                    </select>
                    <br/>
                    <button onClick={this.addNewUser}>Ok</button>
                    <button onClick={this.cancelAddNewUser}>Cancel</button>
                </div>
            </div>
            <div ref={(it) => this.changePasswordDialog = it} className="modal">
                <div className="form">
                    <h1>Change password for user <span ref={(it) => this.changePasswordUser = it}>USER</span></h1>
                    <label>Password:</label>
                    <input ref={(it) => this.changePasswordValue = it} type="text" required={true}/><br/>
                    <br/>
                    <button onClick={this.changePassword}>Ok</button>
                    <button onClick={this.cancelChangePassword}>Cancel</button>
                </div>
            </div>
            <div ref={(it) => this.changeAccessLevelDialog = it} className="modal">
                <div className="form">
                    <h1>Change access level for user <span ref={(it) => this.changeAccessLevelUser = it}>USER</span></h1>
                    <label>Access level:</label>
                    <select ref={(it) => this.changeAccessLevelValue = it} required={true}>
                        <option value="Basic">Basic</option>
                        <option value="Installer">Installer</option>
                        <option value="Expert">Expert</option>
                        <option value="QSP">Qualified service personnel</option>
                    </select>
                    <br/>
                    <button onClick={this.changeAccessLevel}>Ok</button>
                    <button onClick={this.cancelChangeAccessLevel}>Cancel</button>
                </div>
            </div>
        </div>
    }

    private updateUserList() {
        this.props.client.callExtension("UserManagement", "list");
    }

    private deleteUser(username: string) {
        this.props.client.callExtension("UserManagement", "remove", new Map([
            ["username", username]
        ]));
    }

    private showNewUserDialog = () => {
        this.createUserName!!.value = "";
        this.createUserPassword!!.value = "";
        this.createUserDialog?.style.setProperty('display', 'flex');
    }

    private addNewUser = () => {
        this.createUserDialog?.style.setProperty('display', 'none');

        let username = this.createUserName?.value;
        let password = this.createUserPassword?.value;
        let accessLevel = this.createUserAccessLevel?.value;

        if (!username) {
            ToastHelper.error(undefined, "Failed to add new user: Username missing");
            return;
        }
        if (!password) {
            ToastHelper.error(undefined, "Failed to add new user: Password missing");
            return;
        }

        this.props.client.callExtension("UserManagement", "add", new Map<string,string>([
            ["username", username],
            ["password", password],
            ["access_level", accessLevel!!.toString()]
        ]));
    }

    private cancelAddNewUser = () => {
        this.createUserDialog?.style.setProperty('display', 'none');
    }

    private showChangePasswordDialog(username: string) {
        this.changePasswordUser!!.innerText = username;
        this.changePasswordDialog?.style.setProperty('display', 'flex');
    }

    private changePassword = () => {
        this.changePasswordDialog?.style.setProperty('display', 'none');

        const username = this.changePasswordUser?.innerText;
        const password = this.changePasswordValue?.value;
        if (!username) {
            ToastHelper.error(undefined, "Failed to change password: User missing");
            return;
        }
        if (!password) {
            ToastHelper.error(undefined, "Failed to change password: Password missing");
            return;
        }

        this.props.client.callExtension("UserManagement", "change_password", new Map<string,string>([
            ["username", username],
            ["password", password]
        ]));
    }

    private cancelChangePassword = () => {
        this.changePasswordDialog?.style.setProperty('display', 'none');
    }

    private showChangeAccessLevelDialog(username: string, accessLevel: string) {
        this.changeAccessLevelUser!!.innerText = username;
        this.changeAccessLevelValue!!.value = accessLevel;
        this.changeAccessLevelDialog?.style.setProperty('display', 'flex');
    }

    private changeAccessLevel = () => {
        this.changeAccessLevelDialog?.style.setProperty('display', 'none');

        const username = this.changeAccessLevelUser?.innerText;
        const accessLevel = this.changeAccessLevelValue?.value;
        if (!username) {
            ToastHelper.error(undefined, "Failed to change access level: User missing");
            return;
        }
        if (!accessLevel) {
            ToastHelper.error(undefined, "Failed to change access level: Access level invalid");
            return;
        }

        this.props.client.callExtension("UserManagement", "change_access_level", new Map<string,string>([
            ["username", username],
            ["access_level", accessLevel]
        ]));
    }

    private cancelChangeAccessLevel = () => {
        this.changeAccessLevelDialog?.style.setProperty('display', 'none');
    }

    onExtensionCalled(extension: string, command: string, status: SIExtensionStatus, parameters: Map<string, string>, body: string) {
        if (extension === "UserManagement") {
            if (command === "list") {
                if (status === SIExtensionStatus.SUCCESS) {
                    try {
                        const users = new Map<string,string>(Object.entries(JSON.parse(body)));
                        this.setState({
                            users: users
                        });
                        return;
                    } catch (e) {}
                }
                ToastHelper.error(undefined, "Failed to retrieve user list");
            } else if (command === "remove") {
                if (status === SIExtensionStatus.SUCCESS) {
                    ToastHelper.info(undefined, "User removed");
                    this.updateUserList();
                } else {
                    ToastHelper.error(undefined, "Failed to remove user");
                }
            } else if (command === "add") {
                if (status === SIExtensionStatus.SUCCESS) {
                    ToastHelper.info(undefined, "User added");
                    this.updateUserList();
                } else {
                    ToastHelper.error(undefined, "Failed to add user");
                }
            } else if (command === "change_password") {
                if (status === SIExtensionStatus.SUCCESS) {
                    ToastHelper.info(undefined, "Password changed");
                } else {
                    ToastHelper.error(undefined, "Failed to change password");
                }
            } else if (command === "change_access_level") {
                if (status === SIExtensionStatus.SUCCESS) {
                    ToastHelper.info(undefined, "Access level changed");
                    this.updateUserList();
                } else {
                    ToastHelper.error(undefined, "Failed to change access level");
                }
            }
        }
    }
}

export default UserManagement