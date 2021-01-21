// core imports
import React from 'react';

interface SignupProps {
    signUp:(event: React.MouseEvent<HTMLElement,MouseEvent>, username: string, password: string) => void;
}
interface SignupState {
    [key: string]: string;
}
export class SignUp extends React.Component<SignupProps,SignupState> {
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
        const signUp  = (event: React.MouseEvent<HTMLElement>, username: string, password: string) => {
            // clear input fields
            this.setState({
                username:'',
                password:''
            });
            // call parent function
            this.props.signUp(event,username,password)
        }
        return (
            <form id="signupForm">
                <h1>Sign Up</h1>
                <input 
                    type="text"
                    placeholder="Username"
                    name="username"
                    value={this.state.username}
                    onChange={this.handleInputChange}
                />
                <input 
                    type="password"
                    placeholder="Password (6+ char. min)"
                    name="password"
                    value={this.state.password}
                    onChange={this.handleInputChange}
                />
                <button onClick={(event) => signUp(event,this.state.username,this.state.password)}>Sign Up</button>
                <div className="clear"></div>
            </form>
        )
    }
}