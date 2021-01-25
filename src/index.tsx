// Core imports
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import * as Realm from 'realm-web';
import bson from 'bson'; // for ObjectID translation
// Components
import {SignUp} from './components/signUp';
import {LogIn} from './components/logIn';
import {Loader} from './components/loader';
import {NewTaskEntry} from './components/newTaskEntry';
import {TaskList} from './components/taskList';
import {UserProfile} from './components/userProfile';
// Constants
import {Constants,Msgs} from './components/constants';
// Interfaces
import {ITask} from './components/ITask';
// Styles
import './styles.css'

// Connection
const app = new Realm.App({ id: Constants.appID});
const mongoTaskCollection = app.services.mongodb('mongodb-atlas').db(Constants.database).collection(Constants.taskColl);
const mongoUserCollection = app.services.mongodb('mongodb-atlas').db(Constants.database).collection(Constants.userColl);

// Main App
interface AppState {
    tasks: Array<ITask>;
    user: string;
    msgBanner: {show:boolean, msg?:string};
}
class App extends React.Component<{},AppState> {
    constructor(props: never) {
        super(props);
        this.state = {
            tasks:[],
            user:'',
            msgBanner: {show:false}
        }
    }
    // fetch task list when reloading
    componentDidMount() {
        // get user from local storage and save to state
        const user = localStorage.getItem('user');
        user != null ? this.setState({user:user}) : console.log('User error');
        // if we're logged in, then attempt to load posts
        if (user) {
            // start task loading animation
            this.setState({msgBanner:{show:true,msg:'Loading Tasks'}});
            // anonymous function to retrieve tasks from server when page loads
            (async () => {
                try {   
                    // get tasks associated with current user
                    const tasks = await mongoTaskCollection.find({user:user});
                    // load tasks to state
                    this.setState({tasks:tasks})
                    // finish task loading animation
                    this.setState({msgBanner:{show:false,msg:''}});
                } catch(error) {
                    throw error;
                }
            })();
        }
    }
    render() {
        const addTask = async (event: React.MouseEvent<HTMLElement>, taskTitle: string, dueDate: string): Promise<void> => {
            // prevent page from refreshing
            event.preventDefault(); 
            // starting loading animation
            this.setState({msgBanner:{show:true,msg:Msgs.addingTask}});
            // don't continue if invalid task
            if (isInvalidTaskTitle(taskTitle)) {
                this.setState({msgBanner:{show:true,msg:Msgs.invalidTask}});
                // hide the failer banner
                setTimeout(() => {
                    // modify temp object to maintain existing properties
                    const tempMsgBanner=this.state.msgBanner;
                    tempMsgBanner.show=false;
                    this.setState({msgBanner:tempMsgBanner});
                },2000);
            } else {
                // server operations
                try {
                    // check for valid user info
                    if (this.state.user == null) {
                        this.setState({msgBanner:{show:true,msg:Msgs.missingUser}});
                        throw new Error('Invalid user info');
                    }
                    // server operation (only send due date if entered)
                    if (dueDate !== '') {
                        // get date string for server storage
                        const localDueDate=Date.parse(dueDate.replace(/-/g,"/"));
                        // insert task
                        const newID = await mongoTaskCollection.insertOne({
                            title:taskTitle,status:true,complete:false,user:this.state.user,dueDate:localDueDate
                        });
                        // update state with new task (for real time updates on page)
                        this.setState((state) => {
                            state.tasks.push({
                                _id:new bson.ObjectId(newID.insertedId.id),title:taskTitle,status:true,complete:false,user:this.state.user,dueDate:localDueDate
                            });
                            return {tasks:state.tasks}
                        });
                    } else {
                        const newID = await mongoTaskCollection.insertOne({
                            title:taskTitle,status:true,complete:false,user:this.state.user
                        }); 
                        // update state with new task (for real time updates on page)
                        this.setState((state) => {
                            state.tasks.push({
                                _id:new bson.ObjectId(newID.insertedId.id),title:taskTitle,status:true,complete:false,user:this.state.user
                            });
                            return {tasks:state.tasks}
                        });    
                    }
                    
                    // clear loading animation
                    setTimeout(() => {
                        // modify temp object to maintain existing properties
                        const tempMsgBanner=this.state.msgBanner;
                        tempMsgBanner.show=false;
                        this.setState({msgBanner:tempMsgBanner});
                    },300);
                } catch(error) {
                    throw(error);
                }
            }   
        }
        const isInvalidTaskTitle = (taskTitle: string|null) => {
            if (taskTitle === '' || taskTitle == null) return true;
            return false;
        }
        const logout = async (): Promise<void> => {
            try {
                // server operation
                await app.currentUser?.logOut().then(() => this.setState({
                    user:''
                }));
                // clear local storage (stop "remembering" user info)
                localStorage.setItem('user','');
                // clear any notifications hanging around
                this.setState({msgBanner: {show:false}});
            } catch(error) {
                throw(error);
            }
        }
        const completeTask = async (id: string, status: boolean): Promise<void> => {
            try {
                // get index of task we're removing
                const index = this.state.tasks.findIndex((el) => el._id.toString() === id);
                // set state
                this.setState((state) => {
                    state.tasks[index].complete=!status;
                    return {tasks:state.tasks}
                });
                // update task on server
                await mongoTaskCollection.updateOne(
                    {_id: new bson.ObjectId(id)},
                    {$set: {'complete': !status}} // toggle true/false flag
                );
            } catch(error) {
                throw(error);
            }
        }
        const saveTask = async (event: React.MouseEvent<HTMLElement>, id: string, newTitle: string): Promise<void> => {
            // stop page refresh
            event.preventDefault();
            console.log(newTitle);
            // server ops
            try {                
                // get index of task we're removing
                const index = this.state.tasks.findIndex((el) => el._id.toString() === id);
                // update state 
                this.setState((state) => {
                    state.tasks[index].title=newTitle;
                    return {tasks:state.tasks}
                });
                // update server
                await mongoTaskCollection.updateOne(
                    {_id: new bson.ObjectId(id)},
                    {$set: {'title': newTitle}} // toggle true/false flag
                );
            } catch {
                console.log('Unable to update task.')
            }
        }
        const deleteTask = async (id: string): Promise<void> => {
            try {
                // get index of task we're removing
                const index = this.state.tasks.findIndex((el) => el._id.toString() === id);
                // update state
                this.setState((state) => {
                    state.tasks.splice(index,1);
                    return {tasks:state.tasks}
                });
                // remove tasks on server
                await mongoTaskCollection.deleteOne(
                    {_id: new bson.ObjectId(id)}
                );
            } catch {
                console.log('Unable to delete Task.')
            }
        }
        const logIn = async (event: React.MouseEvent<HTMLElement>, username: string, password: string): Promise<void> => {
            // prevent page refresh
            event.preventDefault();
            // start banner
            this.setState({msgBanner: {show:true,msg:Msgs.loggingIn}});
            // Create an anonymous credential
            let credentials=Realm.Credentials.emailPassword(username, password);
            let user = null;
            try {
                // Authenticate the user
                user = await app.logIn(credentials);
                // update state to trigger page refresh
                this.setState({user:user.id});
                // save off to local storage so it will persist on refresh
                if (this.state.user != null) localStorage.setItem('user',this.state.user)
                // reset any warnings messages
                this.setState({msgBanner:{show:false}})
            } catch {
                // trigger warning banner
                this.setState({msgBanner:{show:true,msg:Msgs.failedLogin}});
            }
            // load posts if login was successful
            if (user) {
                // start loading posts indicator
                this.setState({msgBanner:{show:true,msg:Msgs.loadingTasks}});
                // get posts from server
                (async () => {
                    try {
                        const tasks = await mongoTaskCollection.find({user:this.state.user}); // find non-deleted tasks
                        this.setState({tasks:tasks})
                        // finish task loading animation
                        this.setState({msgBanner:{show:false}});
                    } catch {
                        throw new Error('Failed to retrieve tasks');
                    }
                })();
            } else {
                // if no user, then login failed
                this.setState({msgBanner: {show:true,msg:Msgs.failedLogin}});
                // hide warning
                setTimeout(() => {
                    // modify temp object to maintain existing properties
                    const tempMsgBanner=this.state.msgBanner;
                    tempMsgBanner.show=false;
                    this.setState({msgBanner:tempMsgBanner});
                },2000);
            }
        }
        const signUp = async (event: React.MouseEvent<HTMLElement>, username: string, password: string): Promise<void> => {
            // stop page refresh
            event.preventDefault();
            // validate input else showing in progress indicator
            if (isInvalidPassword(password) || isInvalidUsername(username)) {
                this.setState({msgBanner: {show:true,msg:Msgs.invalidCreds}});
            } else {
                // in progress banner
                this.setState({msgBanner: {show:true,msg:Msgs.signingUp}});
                // server request to create user
                try {
                    await app.emailPasswordAuth.registerUser(username,password);
                    // show success banner
                    this.setState({msgBanner: {show:true,msg:Msgs.successfulSignup}});
                } catch {
                    // show failure banner
                    this.setState({msgBanner: {show:true,msg:Msgs.failedSignup}});
                }
            }
        }
        const isInvalidUsername = (username: string|null) => {
            if (username == null || username === '') return true;
            return false;
        }
        const isInvalidPassword = (password: string|null) => {
            if (password == null || password.length <= 6) return true;
            return false
        }
        const updateUserName = async (event:React.FormEvent<EventTarget>,userId:string,newName:string): Promise<void> => {
            // stop page refresh
            event.preventDefault();
            // in progress banner
            this.setState({msgBanner: {show:true, msg:Msgs.changingName}})
            // server ops
            try {
                await mongoUserCollection.updateOne(
                    {_id: userId},
                    {$set: {'prettyName': newName}} // update user's name
                );
                // success banner
                this.setState({msgBanner: {show: true, msg:Msgs.successfulNameChange}})
                // hide the success banner
                setTimeout(() => {
                    // modify temp object to maintain existing properties
                    const tempMsgBanner=this.state.msgBanner;
                    tempMsgBanner.show=false;
                    this.setState({msgBanner:tempMsgBanner});
                },2000);
            } catch(error) {
                throw(error);
            }
        }
        // if logged in
        if (this.state.user) {
            return (
                <Router><Switch>
                <Route path='/' exact
                    render={() => (
                        <div>
                            <Loader displayFlag={this.state.msgBanner.show} msg={this.state.msgBanner.msg} />
                            <div id="nav">
                                <h1 id="taskTitle">Tasks</h1>
                                <Link to='/settings/'>Settings</Link>
                                <div className="clear"></div>
                            </div>
                            <NewTaskEntry addTask={addTask} />
                            <TaskList tasks={this.state.tasks} deleteTask={deleteTask} completeTask={completeTask} saveTask={saveTask} />    
                            <button id="logoutButton" onClick={() => logout()}>Log Out</button>
                        </div>
                    )}
                />
                <Route path='/settings/'
                    render={() => (
                        <div>
                            <Loader displayFlag={this.state.msgBanner.show} msg={this.state.msgBanner.msg} />
                            <UserProfile updateUserName={updateUserName} user={this.state.user} />
                        </div>       
                    )}        
                />  
                </Switch></Router>
            );
        // if not logged in
        } else {
            return (
                <div>
                    <Loader displayFlag={this.state.msgBanner.show} msg={this.state.msgBanner.msg} />
                    <LogIn logIn={logIn} />
                    <SignUp signUp={signUp} />
                </div>
                
            );
        }
    }
}

ReactDOM.render(<App />,document.getElementById('root'));