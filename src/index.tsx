import React, { createRef, Ref } from 'react';
import ReactDOM from 'react-dom';
import * as Realm from 'realm-web';
import bson from 'bson'; // for ObjectID translation
// Connection
const app = new Realm.App({ id: "todo-app-mnupq"});
const mongoTaskCollection = app.services.mongodb('mongodb-atlas').db('data').collection('tasks');
const mongoUserCollection = app.services.mongodb('mongodb-atlas').db('data').collection('users');

// Main Wrapper
interface ISingleTask {
    _id: Object;
    complete: boolean;
    status: boolean;
    title: string;
    user: string;
}
interface IAppProps {}
interface IAppState {
    tasks: Array<ISingleTask>;
    user: string | null;
    msgBanner: {show:boolean, msg:string};
}
class App extends React.Component<IAppProps,IAppState> {
    constructor(props: never) {
        super(props);
        // state holds things that require page updates when modified
        this.state = {
            tasks:[],
            user:'',
            msgBanner: {show:false,msg:''}
        }
    }
    // fetch task list when reloading
    componentDidMount() {
        // get user from local storage
        const user = localStorage.getItem('user');
        // restore state
        this.setState({user:user});
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
                } catch {
                    return 'Failed to retrieve tasks';
                }
            })();
        }
    }
    render() {
        const addTask = async (event: React.MouseEvent<HTMLElement>,taskTitle: string) => {
            // prevent page from refreshing
            console.log(event);
            event.preventDefault(); 
            // starting loading animation
            this.setState({msgBanner:{show:true,msg:'Adding in progress'}});
            // get value of input field
            if (taskTitle == null) return false;
            //taskTitle = taskTitle.current.value; 
            // don't continue if empty
            if (taskTitle==='') return false; 
            // clear input fields in form
            // @ts-ignore
            document.getElementById('newTaskEntry').reset();
            // server operations
            try {
                // add new tasks to server 
                const newID = await mongoTaskCollection.insertOne({
                    title:taskTitle,
                    status:true,
                    complete:false,
                    user:this.state.user != null ? this.state.user : ''
                });
                // update state with new task (for real time updates on page)
                this.setState((state) => {
                    state.tasks.push({
                        _id: new bson.ObjectId(newID.insertedId.id), // extract actual ID
                        title: taskTitle,
                        status: true,
                        complete: false,
                        user:this.state.user != null ? this.state.user : ''
                    });
                    return {tasks:state.tasks}
                });
                // clear loading animation
                this.setState({msgBanner:{show:false,msg:''}});
            } catch {
                console.log('Adding task failed!');
            }
        }
        const logout = async () => {
            try {
                // log out 
                // @ts-ignore
                await app.currentUser?.logOut().then(this.setState({
                    user:''
                }));
                // clear local storage
                localStorage.setItem('user','');
            } catch {
                console.log('Unable to Log out');
            }
        }
        const completeTask = async (id: string,status: string) => {
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
            } catch {
                console.log('Unable to complete task');
            }
        }
        const saveEditedTask = async (id: string,newTitle: string) => {
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
        const deleteTask = async (id: string) => {
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
        const logIn = async (event: any, username: React.Ref<HTMLInputElement>, password: React.Ref<HTMLInputElement>) => {
            // prevent page refresh
            event.preventDefault();
            // extract values from refs
            // @ts-ignore
            const usernameString = username.current.value;
            // @ts-ignore
            const passwordString = password.current.value;
            // validate inputs else showing loading indicator
            if (isInvalidUsername(usernameString) || isInvalidPassword(passwordString)) {
                this.setState({msgBanner: {show:true,msg:'Invalid username or password'}});
                return false;
            } else {
                this.setState({msgBanner: {show:true,msg:'Logging in...'}});
            }
            // Create an anonymous credential
            // @ts-ignore
            console.log(usernameString,passwordString);
            let credentials=Realm.Credentials.emailPassword(usernameString, passwordString);
            let user = null;
            try {
              // Authenticate the user
             // @ts-ignore 

              user = await app.logIn(credentials);
              // update state to trigger page refresh
              this.setState({user:user.id});
              // save off to local storage so it will persist on refresh
             if (this.state.user != null) localStorage.setItem('user',this.state.user)
              // reset any warnings messages
              this.setState({msgBanner:{show:false,msg:''}})
            } catch {
                // trigger warning banner
                this.setState({msgBanner:{show:true,msg:'Login Failed'}});
            }
            // load posts if login was successful
            if (user) {
                // start loading posts indicator
                this.setState({msgBanner:{show:true,msg:'Loading Tasks'}});
                // get posts from server
                (async () => {
                    try {
                        const tasks = await mongoTaskCollection.find({user:this.state.user}); // find non-deleted tasks
                        this.setState({tasks:tasks})
                        // finish task loading animation
                        this.setState({msgBanner:{show:false,msg:''}});
                    } catch {
                        return 'Failed to retrieve tasks';
                    }
                })();
            } else {
                // if no user, then login failed
                this.setState({msgBanner: {show:true,msg:'Login Failed'}});
            }
        }
        const signUp = async (event:any,username: React.Ref<HTMLInputElement>, password: React.Ref<HTMLInputElement>) => {
            // stop page refresh
            event.preventDefault();
            // convert to string
            // @ts-ignore
            const usernameString = username.current.value;
            // @ts-ignore
            const passwordString = password.current.balue;
            // validate input else showing in progress indicator
            if (isInvalidPassword(passwordString) || isInvalidUsername(usernameString)) {
                this.setState({msgBanner: {show:true,msg:'Invalid username or password'}});
                return false;
            } else {
                // in progress banner
                this.setState({msgBanner: {show:true,msg:'Signing up...'}});
            }
            // server request to create user
            try {
                await app.emailPasswordAuth.registerUser(usernameString,passwordString);
                // show success banner
                this.setState({msgBanner: {show:true,msg:'Successfully signed up! Please log in.'}});
            } catch {
                // show failure banner
                this.setState({msgBanner: {show:true,msg:'Sign up failed.'}});
            }
        }
        const isInvalidUsername = (username: string|null) => {
            if (username == null) return false;
            if (username !== '') return false; // is valid
            return true; // is not valid
        }
        const isInvalidPassword = (password: string|null) => {
            if (password == null) return false;
            if (password.length >= 6) return false; // is valid
            return true; // is not valid
        }
        const updateUserName = async (event:React.FormEvent<EventTarget>,userId:string,newName:string) => {
            // stop page refresh
            event.preventDefault();
            // in progress banner
            this.setState({msgBanner: {show:true, msg:'Changing Name...'}})
            // server ops
            try {
                await mongoUserCollection.updateOne(
                    {_id: userId},
                    {$set: {'prettyName': newName}} // update user's name
                );
                // success banner
                this.setState({msgBanner: {show: true, msg:'Name Changed!'}})
            } catch {
                console.log('failed to update user name.');
            }
            
        }
        // if logged in
        if (this.state.user) {
            return (
                <div>
                    <Loader displayFlag={this.state.msgBanner.show} msg={this.state.msgBanner.msg} />
                    <NewTaskEntry addTask={addTask} />
                    <TaskList tasks={this.state.tasks} deleteTask={deleteTask} completeTask={completeTask} saveEditedTask={saveEditedTask} />    
                    <UserProfile updateUserName={updateUserName} user={this.state.user} />
                    <button onClick={() => logout()}>Log Out</button>
                </div>  
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
// Edit user information
interface IUserprofileProps {
    updateUserName:any;
    user:any;
}
interface IUserprofileState {
    userInfo:any;
}
class UserProfile extends React.Component<IUserprofileProps,IUserprofileState> {
    private prettyUserName = createRef<HTMLInputElement>();
    constructor(props: any) {
        super(props);
        this.state = {
            userInfo:''
        }
        this.prettyUserName = React.createRef();
    }
    componentDidMount() {
        // load custom user data
        if (!this.props.user) return false;
        try {
            (async () => {
                const userInfo = await mongoUserCollection.findOne({_id:this.props.user});
                this.setState({userInfo:userInfo});
            })();
        } catch {
            console.log('Failed to load user info.');
        }
        
    }
    render() {
        const userPrettyName = this.state.userInfo?.prettyName;
        return (
            <form>
                <h2>Edit User Info</h2>
                <label>Name</label>
                <input
                    type="text"
                    defaultValue={userPrettyName}
                    ref={this.prettyUserName}
                />
                {/*
                 // @ts-ignore */}
                <button onClick={(e) => this.props.updateUserName(e,this.props.user,this.prettyUserName.current.value)}>Save Changes</button>
            </form>
        );
    }
}

// Full task list (composed of many Task components)
interface ITaskListProps {
    tasks:any;
    deleteTask:any;
    completeTask:any;
    saveEditedTask:any;
}
class TaskList extends React.Component<ITaskListProps> {
    render() {    
        let taskList = this.props.tasks.map((task:any,index:number) => {
            return(
                <Task 
                    key={task._id}
                    task={task}
                    deleteTask={this.props.deleteTask}
                    completeTask={this.props.completeTask}
                    saveEditedTask={this.props.saveEditedTask}
                />
            );
        }).reverse(); // puts most recent task on top
        // if still loading tasks
        if (taskList.length === 0) {
            return <p>No tasks</p>
        // if not loading, and we have tasks
        } else {
            return <ul>{taskList}</ul>
        }
    }
}
// Individual Task
interface ITaskProps {
    key: string;
    task:any;
    deleteTask:any;
    completeTask:any;
    saveEditedTask:any;
}
interface ITaskState {
    editMode:boolean;
}
class Task extends React.Component<ITaskProps,ITaskState> {
    private newTitle = createRef<HTMLInputElement>();
    constructor(props: any) {
        super(props);
        this.newTitle = React.createRef();
        this.state = {
            editMode:false
        }
    }
    render() {
        // simplify task ID
        const id=this.props.task._id.toString();
        // enable or disble editing mode
        const toggleEditMode = () => {
            this.setState({editMode:!this.state.editMode})
        }
        // wrapper that allows us to call server routine and update local state
        const saveEditedTaskWrapper = async (event:any,id:number,newTitle:any) => {
            // prevent page refresh
            event.preventDefault();
            // get value from ref
            newTitle = newTitle.current.value;
            // call server function in parent component (allows state to be updated)
            this.props.saveEditedTask(id,newTitle);
            // disable editing mode
            toggleEditMode();
        }
        if (this.state.editMode) {
            return (
                <li>
                    <form>
                        <input 
                            type="text"
                            defaultValue={this.props.task.title}
                            ref={this.newTitle}
                        />
                        <button onClick={(e) => saveEditedTaskWrapper(e,id,this.newTitle)}>Save</button>
                    </form>           
                </li>    
            );
        } else {
            return (
                <li>
                    {this.props.task.title}
                    <CompleteTaskButton 
                        complete={this.props.task.complete} 
                        id={id} 
                        completeTask={this.props.completeTask}
                    />
                    <button onClick={() => toggleEditMode()}>Edit</button>
                    <button onClick={() => this.props.deleteTask(id)}>Delete</button>
                </li>
            );
        }  
    }
}
// Togglable task completion button
interface ICompleteButtonProps {
    complete:any;
    id: number;
    completeTask:any;
}
class CompleteTaskButton extends React.Component<ICompleteButtonProps> {
    render() {
        let buttonText = 'Complete';
        if (this.props.complete) buttonText='Uncomplete';
        return (    
            <button onClick={() => this.props.completeTask(this.props.id,this.props.complete)}>{buttonText}</button>
        )
    }
}

// new task entry form
interface INewTaskEntryProps {
    addTask:any;
}
interface INewTaskEntryState {
    [key: string]: string;
}
class NewTaskEntry extends React.Component<INewTaskEntryProps,INewTaskEntryState> {
    constructor(props:any) {
        super(props);
        // store value of task input field
        this.state = {
            taskText: ''
        }
        this.handleChange = this.handleChange.bind(this);
    }
    // update state when input field is edited
    handleChange({target}: {target:any}) {
        this.setState({
            [target.name]: target.value
        });
    }
    render() { 
        return (
            <form id="newTaskEntry">
                <input 
                    placeholder="Type here..."
                    type="text" 
                    name="taskText"
                    value={this.state.taskText}
                    onChange={this.handleChange}
                />
                <button onClick={(e) => this.props.addTask(e,this.state.taskText)}>Add Task</button>
            </form>
        );
    }
}
// Generic component to dsplay message while waiting for response from server
interface ILoaderProps {
    displayFlag:boolean;
    msg:string;
}
class Loader extends React.Component<ILoaderProps> {
    render() {
        return (this.props.displayFlag) ? this.props.msg : false;
    }
}
// Log in screen
interface ILoginProps {
    logIn:any;
}
class LogIn extends React.Component<ILoginProps> {
    private username: React.RefObject<HTMLInputElement>;
    private password: React.RefObject<HTMLInputElement>;
    constructor(props: any) {
        super(props);
        // refs are eventually passed into logIn() function
        this.username = React.createRef();
        this.password = React.createRef();
    }
    render() {

        return (
            <form>
                <h1>Log In</h1>
                <input 
                    ref={this.username}
                    type="text" 
                    placeholder="Username"
                />
                <input 
                    ref={this.password}
                    type="Password" 
                    placeholder="Password"
                />
                <button onClick={(e) => this.props.logIn(e,this.username,this.password)}>Log In</button>
            </form>
            
        )
    }
}

interface ISignupProps {
    signUp:any;
}
class SignUp extends React.Component<ISignupProps> {
    private username: React.RefObject<HTMLInputElement>;
    private password: React.RefObject<HTMLInputElement>;
    constructor(props: any) {
        super(props);
        // refs are eventually passed into signUp() function
        this.username = React.createRef();
        this.password = React.createRef();
    }
    render() {
        return (
            <form>
                <h1>Sign Up</h1>
                <input 
                    type="text"
                    placeholder="Username"
                    ref={this.username}
                />
                <input 
                    type="password"
                    placeholder="Password (6+ char. min)"
                    ref={this.password}
                />
                <button onClick={(e) => this.props.signUp(e,this.username,this.password)}>Sign Up</button>
            </form>
        )
    }
}

ReactDOM.render(<App />,document.getElementById('root'));