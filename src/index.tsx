// Core imports
import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import * as Realm from 'realm-web';
import bson from 'bson'; // for ObjectID translation
// Components
import {SignUp} from './components/signUp';
import {LogIn} from './components/logIn';
import {Loader} from './components/loader';
import {NewTaskEntry} from './components/newTaskEntry';
import {TaskList} from './components/taskList';
import {UserProfile} from './components/userProfile';
import {Header} from './components/header';
// Constants
import {Constants,Msgs} from './components/constants';
// Styles
import './styles.css'

// Connection
const app = new Realm.App({ id: Constants.appID});
const mongoTaskCollection = app.services.mongodb('mongodb-atlas').db(Constants.database).collection(Constants.taskColl);
const mongoUserCollection = app.services.mongodb('mongodb-atlas').db(Constants.database).collection(Constants.userColl);

const App = () => {

    // initialize state
    const [tasks, setTasks] = useState([]);
    const [user, setUser] = useState('');
    const [name, setName] = useState('');
    const [msgBanner, setMsgBanner] = useState({show:false,msg:''});

    // run when first loading component
    useEffect(() => {      
        // get user from local storage
        const user = localStorage.getItem('user');
        if (user) {
            // update state
            setUser(user);
            // anonymous function to retrieve data when page loads
            (async () => {

                // get tasks on page load
                try {   
                    // start loading posts indicator
                    setMsgBanner({show:true,msg:Msgs.loadingTasks});
                    // get tasks associated with current user
                    const tasks = await mongoTaskCollection.find({user:user});
                    // load tasks to state
                    setTasks(tasks)
                    // hide loading posts indicator
                    setMsgBanner({show:false,msg:''});
                } catch(error) {
                    throw error;
                }

                // get pretty name on page load
                try {
                    (async () => {
                        const userInfo = await mongoUserCollection.findOne({_id:user});
                        setName(userInfo?.prettyName);
                        localStorage.setItem('prettyName',userInfo?.prettyName);
                    })();
                } catch(error) {
                    throw(error);
                }
            })();
        }
    },[]);

    // Add a task to the task list
    const addTask = async (event: React.MouseEvent<HTMLElement>, taskTitle: string, dueDate: string): Promise<void> => {
        // prevent page from refreshing
        event.preventDefault(); 
        // starting loading animation
        setMsgBanner({show:true,msg:Msgs.addingTask});
        // don't continue if invalid task
        if (isInvalidTaskTitle(taskTitle)) {
            setMsgBanner({show:true,msg:Msgs.invalidTask});
            // hide the failer banner
            setTimeout(() => {
                // modify temp object to maintain existing properties
                const tempMsgBanner=msgBanner;
                tempMsgBanner.show=false;
                setMsgBanner(tempMsgBanner);
            },2000);
        } else {
            // server operations
            try {
                // check for valid user info
                if (user == null) {
                    setMsgBanner({show:true,msg:Msgs.missingUser});
                    throw new Error('Invalid user info');
                }
                // handle date weirdness
                let localDueDate;
                if (dueDate !== '') {
                    localDueDate=Date.parse(dueDate.replace(/-/g,"/"));;
                } else {
                    localDueDate=0;
                }
                // insert task on server
                const newID = await mongoTaskCollection.insertOne({
                    title:taskTitle,
                    status:true,
                    complete:false,
                    user:user,
                    dueDate:localDueDate
                });
                // update state with new task (for real time updates on page)
                let tempTasks = tasks;
                tempTasks.push({
                    _id:new bson.ObjectId(newID.insertedId.id),
                    title:taskTitle,
                    status:true,
                    complete:false,
                    user:user,
                    dueDate:localDueDate
                });
                setTasks(tempTasks);
                
                // clear loading animation
                setTimeout(() => {
                    // modify temp object to maintain existing properties
                    const tempMsgBanner=msgBanner;
                    tempMsgBanner.show=false;
                    setMsgBanner(tempMsgBanner);
                },300);
            } catch(error) {
                throw(error);
            }
        }   
    }

    // check if string is an invalid task title
    const isInvalidTaskTitle = (taskTitle: string|null) => {
        if (taskTitle === '' || taskTitle == null) return true;
        // only white space
        if (!taskTitle.replace(/\s/g, '').length) return true;
        return false;
    }

    // Toggle the complete flag on task
    const completeTask = async (id: string, status: boolean): Promise<void> => {
        try {
            // get index of task we're removing
            const index = tasks.findIndex((el) => el._id.toString() === id);
            // set state
            let tempTasks = [...tasks];
            tempTasks[index].complete=!status;
            setTasks(tempTasks);
            // update task on server
            await mongoTaskCollection.updateOne(
                {_id: new bson.ObjectId(id)},
                {$set: {'complete': !status}} // toggle true/false flag
            );
        } catch(error) {
            throw(error);
        }
    }

    // task edited Task
    const saveTask = async (event: React.MouseEvent<HTMLElement>, id: string, newTitle: string, dueDate: number): Promise<void> => {
        // stop page refresh
        event.preventDefault();
        
        // server ops
        try {                
            // get index of task we're removing
            const index = tasks.findIndex((el) => el._id.toString() === id);
            // parse date
            // date handling
            let localDueDate;
            console.log(dueDate);
            if (isNaN(dueDate)) {
                localDueDate=0; // represent no date? 
            } else {
                localDueDate=dueDate;
            }
            // update state 
            const tempTasks=tasks;
            tempTasks[index].title=newTitle;
            tempTasks[index].dueDate=localDueDate;
            setTasks(tempTasks);
            // update server
            await mongoTaskCollection.updateOne(
                {_id: new bson.ObjectId(id)},
                {$set: {'title': newTitle, 'dueDate': localDueDate}} // toggle true/false flag
            );
        } catch(error) {
            throw(error);
        }
    }

    // delete a task
    const deleteTask = async (id: string): Promise<void> => {
        try {
            // get index of task we're removing
            const index = tasks.findIndex((el) => el._id.toString() === id);
            // update state
            const tempTasks = [...tasks];
            tempTasks.splice(index,1);
            setTasks(tempTasks);
            // remove tasks on server
            await mongoTaskCollection.deleteOne(
                {_id: new bson.ObjectId(id)}
            );
        } catch {
            console.log('Unable to delete Task.')
        }
    }

    // Login 
    const logIn = async (event: React.MouseEvent<HTMLElement>, username: string, password: string): Promise<void> => {
        // prevent page refresh
        event.preventDefault();
        // validate input else showing in progress indicator
        if (isInvalidPassword(password) || isInvalidUsername(username)) {
            setMsgBanner({show:true,msg:Msgs.invalidCreds});
        } else {
            // start banner
            setMsgBanner({show:true,msg:Msgs.loggingIn});
            // Create an anonymous credential
            let credentials=Realm.Credentials.emailPassword(username, password);
            let userObject = null;
            let userID = '';
            try {
                // Authenticate the user
                userObject = await app.logIn(credentials);
                console.log(userObject);
                userID = userObject._id; // grab id string
                // update state to trigger page refresh
                setUser(userID);
                username=userObject._profile.email;
                localStorage.setItem('username',username);
                // save off to local storage so it will persist on refresh
                if (userObject != null) localStorage.setItem('user',userID)
                // reset any warnings messages
                setMsgBanner({show:false,msg:''});
            } catch {
                // trigger warning banner
                setMsgBanner({show:true,msg:Msgs.failedLogin});
            }
            // load posts if login was successful
            if (userObject) {
                // start loading posts indicator
                setMsgBanner({show:true,msg:Msgs.loadingTasks});
                // get posts from server
                (async () => {
                    try {
                        const tasks = await mongoTaskCollection.find({user:userID}); // find non-deleted tasks
                        setTasks(tasks)
                        // finish task loading animation
                        setMsgBanner({show:false,msg:''});
                    } catch {
                        throw new Error('Failed to retrieve tasks');
                    }
                })();
            } else {
                // if no user, then login failed
                setMsgBanner({show:true,msg:Msgs.failedLogin});
                // hide warning
                setTimeout(() => {
                    // modify temp object to maintain existing properties
                    const tempMsgBanner=msgBanner;
                    tempMsgBanner.show=false;
                    setMsgBanner(tempMsgBanner);
                },2000);
            }
        }
    }

    // Sign up
    const signUp = async (event: React.MouseEvent<HTMLElement>, username: string, password: string): Promise<void> => {
        // stop page refresh
        event.preventDefault();
        // validate input else showing in progress indicator
        if (isInvalidPassword(password) || isInvalidUsername(username)) {
            setMsgBanner({show:true,msg:Msgs.invalidCreds});
        } else {
            // in progress banner
            setMsgBanner({show:true,msg:Msgs.signingUp});
            // server request to create user
            try {
                await app.emailPasswordAuth.registerUser(username,password);
                // show success banner
                setMsgBanner({show:true,msg:Msgs.successfulSignup});
            } catch {
                // show failure banner
                setMsgBanner({show:true,msg:Msgs.failedSignup});
            }
        }
    }

    // check for invalid username
    const isInvalidUsername = (username: string|null) => {
        if (username == null || username === '') return true;
        return false;
    }

    // check for invalid password
    const isInvalidPassword = (password: string|null) => {
        if (password == null || password.length <= 6) return true;
        return false
    }

    // update settings
    // #TODO: make more generic
    const updateUserName = async (event:React.FormEvent<EventTarget>,userID:string,newName:string): Promise<void> => {
        // stop page refresh
        event.preventDefault();
        // in progress banner
        setMsgBanner({show:true,msg:Msgs.changingName});
        // server ops
        try {
            await mongoUserCollection.updateOne(
                {_id: userID},
                {$set: {'prettyName': newName}} // update user's name
            );
            // trigger header refresh
            setName(newName);
            // update local stroage
            localStorage.setItem('prettyName',newName);
            // success banner
            setMsgBanner({show:true,msg:Msgs.successfulNameChange});
            // hide the success banner
            setTimeout(() => {
                // modify temp object to maintain existing properties
                const tempMsgBanner=msgBanner;
                tempMsgBanner.show=false;
                setMsgBanner(tempMsgBanner);
            },2000);
        } catch(error) {
            throw(error);
        }
    }

    // if logged in
    if (user) {
        return (
            <Router><Switch>
                <Route path='/' exact
                    render={() => (
                        <div id="body">
                            <div id="blur"></div>
                            <Loader displayFlag={msgBanner.show} msg={msgBanner.msg} />
                            <Header 
                                setUser={setUser}
                                setTasks={setTasks}
                                setMsgBanner={setMsgBanner}
                                name={name || localStorage.getItem('prettyName')}

                            />
                            <div id="content">
                                <NewTaskEntry addTask={addTask} />
                                <TaskList 
                                    tasks={tasks} 
                                    loadingStatus={msgBanner.show}
                                    deleteTask={deleteTask} 
                                    completeTask={completeTask} 
                                    saveTask={saveTask} 
                                />    
                                
                            </div>
                        </div>
                    )}
                />
                <Route path='/settings/'
                    render={() => (
                        <div id="body">
                            <Loader displayFlag={msgBanner.show} msg={msgBanner.msg} />
                            <Header 
                                setUser={setUser}
                                setTasks={setTasks}
                                setMsgBanner={setMsgBanner}
                                name={name || localStorage.getItem('prettyName')}
                            />
                            <div id="content">
                                <UserProfile 
                                    updateUserName={updateUserName} 
                                    user={user || localStorage.getItem('prettyName')}
                                />
                            </div>
                        </div>       
                    )}        
                />  
            </Switch></Router>
        );

    // if not logged in
    } else {
        return (
            <div id="content">
                <Loader displayFlag={msgBanner.show} msg={msgBanner.msg} />
                <LogIn logIn={logIn} />
                <SignUp signUp={signUp} />
            </div>
        );
    }
}

ReactDOM.render(<App />,document.getElementById('root'));