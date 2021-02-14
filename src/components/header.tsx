// core imports 
import React from 'react';
import * as Realm from 'realm-web';
import {NavLink} from 'react-router-dom';
// constants
import { Constants } from './constants';
// Connection
const app = new Realm.App({ id: Constants.appID});

interface props {
    name: string;
    setUser: (value: React.SetStateAction<string>) => void;
    setTasks: (value: React.SetStateAction<any[]>) => void;
    setMsgBanner: (value: React.SetStateAction<{show:boolean,msg: string}>) => void;
}

export const Header = (props: props) => {

    // Log out 
    const logout = async (): Promise<void> => {
        try {
            // server operation
            await app.currentUser?.logOut().then(() => props.setUser(''));
            // clear local storage (stop "remembering" user info)
            //localStorage.setItem('user','');
            localStorage.clear();
            // clear all data
            props.setMsgBanner({show:false,msg:''});
            props.setTasks([]);
            props.setUser('');
        } catch(error) {
            throw(error);
        }
    }

    // if no name, hide entire string
    const welcomeString = (props.name) ? `Hello, ${props.name}` : '';

    return (
        <div id="header">
            <ul id="nav">
                <li><NavLink activeClassName='active' to='/' exact>Tasks</NavLink></li>
                <li><NavLink activeClassName='active' to='/settings/'>Settings</NavLink></li>
            </ul>
            <div onClick={() => logout()} id="logoutButton">Log Out</div>
            <div className="profile">{welcomeString}</div>
            <div className="clear"></div>
        </div>  
    );
}