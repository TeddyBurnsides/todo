// core imports 
import React, {useEffect, useState} from 'react';
import * as Realm from 'realm-web';
import {Link} from 'react-router-dom';
// constants
import { Constants } from './constants';
// Connection
const app = new Realm.App({ id: Constants.appID});
const mongoUserCollection = app.services.mongodb('mongodb-atlas').db(Constants.database).collection(Constants.userColl);

// Edit user information
interface props {
    deleteAccount:(event:React.FormEvent<EventTarget>,userId:string) => void;
    updateUserName:(event:React.FormEvent<EventTarget>,userId:string,newName:string) => void;
    user:string;
}
export const UserProfile = (props: props) => {

    // initialize state
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');

    // only run on component load
    useEffect(() => {
        // require user to begin
        if (!props.user) throw new Error('No user!');
        // server ops
        try {
            (async () => {
                const userInfo = await mongoUserCollection.findOne({_id:props.user});
                setName(userInfo?.prettyName);
                setUsername(userInfo.username);
            })();
        } catch(error) {
            throw(error);
        }
    },[props.user]);

    return (
        <form className="standard">

            <Link className="backLink" to='/'><button>← Return to tasks</button></Link>
            
            <div id="nav">
                <h1 id="settingsTitle">Settings</h1>
                <div className="clear"></div>
            </div>
            
            <label>Username</label>
            <input type="text" value={username} disabled />

            <label>Full Name</label>
            <input
                type="text"
                value={name}
                name="name"
                onChange={event => setName(event.target.value)}
            />
            
            <button className="deleteButton" onClick={(event) => props.deleteAccount(event,props.user)}>Delete Account</button>
            <button className="saveButton" onClick={(event) => props.updateUserName(event,props.user,name)}>Save</button>
        
            <div className="clear"></div>
        </form>
    );
}