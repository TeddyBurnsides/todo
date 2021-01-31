// core imports
import React, {useState} from 'react';

interface props {
    signUp:(event: React.MouseEvent<HTMLElement,MouseEvent>, username: string, password: string) => void;
}
export const SignUp = (props: props) => {
   
    // initialize state
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');

    // signup wrapper
    const signUp  = (event: React.MouseEvent<HTMLElement>, username: string, password: string) => {
        // reset state
        setUsername('');
        setPassword('');
        // call parent function
        props.signUp(event,username,password);
    }

    return (
        <form className="standard">
            <h1>Sign Up</h1>
            <label>Username</label>
            <input 
                type="text"
                name="username"
                value={username}
                onChange={event => setUsername(event.target.value)}
            />
            <label>Password (6 character minimum)</label>
            <input 
                type="password"
                name="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
            />
            <button className="saveButton" onClick={event => signUp(event,username,password)}>Sign Up</button>
            <div className="clear"></div>
        </form>
    )
}