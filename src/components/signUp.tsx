import React from 'react';

interface ISignupProps {
    signUp:(event: React.MouseEvent<HTMLElement,MouseEvent>, username: string, password: string) => void;
}
interface ISignupState {
    [key: string]: string;
}
class SignUp extends React.Component<ISignupProps,ISignupState> {
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
            <form>
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
            </form>
        )
    }
}

export default SignUp;