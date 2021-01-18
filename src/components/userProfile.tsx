// core imports 
import React from 'react';
import * as Realm from 'realm-web';
// constants
import Constants from './constants';
// Connection
const app = new Realm.App({ id: Constants.appID});
const mongoUserCollection = app.services.mongodb('mongodb-atlas').db(Constants.database).collection(Constants.userColl);

// Edit user information
interface IUserprofileProps {
    updateUserName:(event:React.FormEvent<EventTarget>,userId:string,newName:string) => void;
    user:string;
}
interface IUserprofileState {
    [key: string]: string;
}
class UserProfile extends React.Component<IUserprofileProps,IUserprofileState> {
    constructor(props: any) {
        super(props);
        this.state = {
            prettyUsername:'',
            username:''
        }
        this.handleInputChange = this.handleInputChange.bind(this);
    }
    handleInputChange({target}: {target:HTMLInputElement}) {
        this.setState({
            [target.name]: target.value
        });
    }
    componentDidMount() {
        // load custom user data
        if (!this.props.user) throw new Error('No user!');
        try {
            (async () => {
                const userInfo = await mongoUserCollection.findOne({_id:this.props.user});
                this.setState({
                    prettyUsername:userInfo.prettyName,
                    username:userInfo.username
                })
            })();
        } catch {
            console.log('Failed to load user info.');
        }
    }
    render() {
        return (
            <form>
                <h2>Profile</h2>
                <label>Username: </label>
                <span>{this.state.username}</span>
                <br />
                <label>Name: </label>
                <input
                    type="text"
                    value={this.state.prettyUsername}
                    name="prettyUsername"
                    onChange={this.handleInputChange}
                />
                <button onClick={(event) => this.props.updateUserName(event,this.props.user,this.state.prettyUsername)}>Save Changes</button>
            </form>
        );
    }
}

export default UserProfile;