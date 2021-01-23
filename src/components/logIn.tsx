// core imports
import React from 'react';

// Log in screen
interface LoginProps {
    logIn:(event: React.MouseEvent<HTMLElement,MouseEvent>, username: string, password: string) => void;
}
interface LoginState {
    [key: string]: string;
}
export class LogIn extends React.Component<LoginProps,LoginState> {
    constructor(props: any) {
        super(props);
        this.state = {
            username:'',
            password:''
        }
        this.handleInputChange = this.handleInputChange.bind(this);
    }
    handleInputChange({target}: {target:HTMLInputElement}) {
        this.setState({
            [target.name]: target.value
        });
    }
    render() {
        const logIn = (event: React.MouseEvent<HTMLElement>, username: string, password: string) => {
            this.setState({username:'',password:''});
            this.props.logIn(event,username,password)
        }
        return (
            <form id="loginForm" className="standard">
                <h1>Log In</h1>
                <label>Username</label>
                <input 
                    name="username"
                    value={this.state.username}
                    onChange={this.handleInputChange}
                    type="text" 
                />
                <label>Password</label>
                <input 
                    name="password"
                    value={this.state.password}
                    onChange={this.handleInputChange}
                    type="Password" 
                />
                <button onClick={(event) => logIn(event,this.state.username,this.state.password)}>Log In</button>
                <div className="clear"></div>
            </form>
        )
    }
}