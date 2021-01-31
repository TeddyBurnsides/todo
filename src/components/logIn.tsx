// core imports
import React, {useState} from 'react';

// Log in form
interface props {
    logIn:(event: React.MouseEvent<HTMLElement,MouseEvent>, username: string, password: string) => void;
}
export const LogIn = (props: props) => {

    // initialize state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // wrappper for main Login function
    const logIn = (event: React.MouseEvent<HTMLElement>, username: string, password: string) => {
        // reset state
        setUsername('');
        setPassword('');
        // call main function
        props.logIn(event,username,password);
    }

    return (
        <form id="loginForm" className="standard">
            <h1>Log In</h1>
            <label>Username</label>
            <input 
                name="username"
                value={username}
                onChange={event => setUsername(event.target.value)}
                type="text" 
            />
            <label>Password</label>
            <input 
                name="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                type="Password" 
            />
            <button onClick={event => logIn(event,username,password)}>Log In</button>
            <div className="clear"></div>
        </form>
    )
}