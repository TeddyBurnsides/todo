import React, { createRef } from 'react';
import ReactDOM from 'react-dom';
import * as Realm from 'realm-web';
import bson from 'bson'; // for ObjectID translation
// Connection
const app = new Realm.App({ id: "todo-app-mnupq"});
const mongoTaskCollection = app.services.mongodb('mongodb-atlas').db('data').collection('tasks');
const mongoUserCollection = app.services.mongodb('mongodb-atlas').db('data').collection('users');

// Main Wrapper
interface ITask {
    _id: Object;
    complete: boolean;
    status: boolean;
    title: string;
    user: string;
}
interface IAppState {
    tasks: Array<ITask>;
    user: string;
    msgBanner: {show:boolean, msg?:string};
}
class App extends React.Component<{},IAppState> {
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
        const addTask = async (event: React.MouseEvent<HTMLElement>, taskTitle: string) => {
            // prevent page from refreshing
            event.preventDefault(); 
            // starting loading animation
            this.setState({msgBanner:{show:true,msg:'Adding in progress'}});
            // don't continue if invalid task
            if (isInvalidTask(taskTitle)) {
                this.setState({msgBanner:{show:true,msg:'Invalid task'}});
                return false;
            }
            // server operations
            try {
                // check for valid user info
                if (this.state.user == null) {
                    this.setState({msgBanner:{show:true,msg:'User error'}});
                    return false;
                }
                // server operation
                const newID = await mongoTaskCollection.insertOne({
                    title:taskTitle,
                    status:true,
                    complete:false,
                    user:this.state.user
                });
                // update state with new task (for real time updates on page)
                this.setState((state) => {
                    state.tasks.push({
                        _id: new bson.ObjectId(newID.insertedId.id), // extract actual ID
                        title: taskTitle,
                        status: true,
                        complete: false,
                        user:this.state.user
                    });
                    return {tasks:state.tasks}
                });
                // clear loading animation
                this.setState({msgBanner:{show:false}});
            } catch(error) {
                throw(error);
            }
        }
        const isInvalidTask = (taskTitle: string|null) => {
            if (taskTitle === '' || taskTitle == null) return true;
            return false;
        }
        const logout = async () => {
            try {
                // server operation
                await app.currentUser?.logOut().then(() => this.setState({
                    user:''
                }));
                // clear local storage (stop "remembering" user info)
                localStorage.setItem('user','');
            } catch(error) {
                throw(error);
            }
        }
        const completeTask = async (id: string, status: boolean) => {
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
        const saveTask = async (event: React.MouseEvent<HTMLElement>, id: string, newTitle: string) => {
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
        const logIn = async (event: React.MouseEvent<HTMLElement>, username: string, password: string) => {
            // prevent page refresh
            event.preventDefault();
            // validate inputs else showing loading indicator
            if (isInvalidUsername(username) || isInvalidPassword(password)) {
                this.setState({msgBanner: {show:true,msg:'Invalid username or password'}});
                return false;
            } else {
                this.setState({msgBanner: {show:true,msg:'Logging in...'}});
            }
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
                        this.setState({msgBanner:{show:false}});
                    } catch {
                        return 'Failed to retrieve tasks';
                    }
                })();
            } else {
                // if no user, then login failed
                this.setState({msgBanner: {show:true,msg:'Login Failed'}});
            }
        }
        const signUp = async (event: React.MouseEvent<HTMLElement>, username: string, password: string) => {
            // stop page refresh
            event.preventDefault();
            // validate input else showing in progress indicator
            if (isInvalidPassword(password) || isInvalidUsername(username)) {
                this.setState({msgBanner: {show:true,msg:'Invalid username or password'}});
                return false;
            } else {
                // in progress banner
                this.setState({msgBanner: {show:true,msg:'Signing up...'}});
            }
            // server request to create user
            try {
                await app.emailPasswordAuth.registerUser(username,password);
                // show success banner
                this.setState({msgBanner: {show:true,msg:'Successfully signed up! Please log in.'}});
            } catch {
                // show failure banner
                this.setState({msgBanner: {show:true,msg:'Sign up failed.'}});
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
                    <TaskList tasks={this.state.tasks} deleteTask={deleteTask} completeTask={completeTask} saveTask={saveTask} />    
                    <UserProfile updateUserName={updateUserName} user={this.state.user} />
                    <br />
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
        if (!this.props.user) return false;
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
// Full task list (composed of many Task components)
interface ITaskListProps {
    tasks:Array<ITask>;
    deleteTask:(id: string) => void;
    completeTask:(id: string, status:boolean) => void;
    saveTask:(event: React.MouseEvent<HTMLElement,MouseEvent>, id: string, newTitle: string) => void;
}
class TaskList extends React.Component<ITaskListProps> {
    render() {    
        let taskList = this.props.tasks.map((task:ITask) => {
            return(
                <Task 
                    key={task._id.toString()}
                    task={task}
                    deleteTask={this.props.deleteTask}
                    completeTask={this.props.completeTask}
                    saveTask={this.props.saveTask}
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
    task: ITask;
    deleteTask:(id: string) => void;
    completeTask:(id: string, status:boolean) => void;
    saveTask:(event: React.MouseEvent<HTMLElement,MouseEvent>, id: string, newTitle: string) => void;
}
interface ITaskState {
    editMode:boolean;
    title: string;
}
class Task extends React.Component<ITaskProps,ITaskState> {
    constructor(props: any) {
        super(props);
        this.state = {
            editMode:false,
            title:this.props.task.title // initialize with existing title
        }
        this.handleInputChange = this.handleInputChange.bind(this);
    }
    handleInputChange({target}: {target:HTMLInputElement}) {
        this.setState({
            title: target.value
        });
    }
    render() {
        // simplify task ID
        const id=this.props.task._id.toString();
        // toggle Edit Mode
        const toggleEditMode = () => {
            this.setState({editMode:!this.state.editMode})
        }
        // wrapper that allows us to call server routine and update local state
        const saveTask = async (event: React.MouseEvent<HTMLElement,MouseEvent>, id: string, title: string) => {
            // call server function in parent component (allows state to be updated)
            this.props.saveTask(event,id,title);
            // disable editing mode
            toggleEditMode();
        }
        if (this.state.editMode) {
            return (
                <li>
                    <form>
                        <input 
                            type="text"
                            value={this.state.title}
                            onChange={this.handleInputChange}
                        />
                        <button onClick={(event) => saveTask(event,id,this.state.title)}>Save</button>
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
    complete:boolean;
    id: string;
    completeTask:(id: string, status: boolean) => void;
}
class CompleteTaskButton extends React.Component<ICompleteButtonProps> {
    render() {
        // assign button text depending on completion status of task
        let buttonText = this.props.complete ? 'Uncomplete' : 'Complete';
        return (    
            <button onClick={() => this.props.completeTask(this.props.id,this.props.complete)}>{buttonText}</button>
        )
    }
}
// new task entry form
interface INewTaskEntryProps {
    addTask:(event: React.MouseEvent<HTMLElement,MouseEvent>, taskTitle: string) => void;
}
interface INewTaskEntryState {
    [key: string]: string;
}
class NewTaskEntry extends React.Component<INewTaskEntryProps,INewTaskEntryState> {
    constructor(props:any) {
        super(props);
        this.state = {
            taskText: '' // task input field
        }
        this.handleInputChange = this.handleInputChange.bind(this);
    }
    // update state when input field is edited
    handleInputChange({target}: {target:HTMLInputElement}) {
        this.setState({
            [target.name]: target.value
        });
    }
    
    render() {
        // clear local state (tied to input field) and call parent function to add task
        const addTask = (event: React.MouseEvent<HTMLElement>,taskTitle: string) => {
            this.setState({taskText:''}); // resets input field
            this.props.addTask(event,taskTitle);
        }
        return (
            <form id="newTaskEntry">
                <input 
                    placeholder="Type here..."
                    type="text" 
                    name="taskText"
                    value={this.state.taskText}
                    onChange={this.handleInputChange}
                />
                <button onClick={(event) => addTask(event,this.state.taskText)}>Add Task</button>
            </form>
        );
    }
}
// Generic component to dsplay message while waiting for response from server
interface ILoaderProps {
    displayFlag:boolean;
    msg?:string;
}
class Loader extends React.Component<ILoaderProps> {
    render() {
        return (
            <div>
                {this.props.displayFlag ? this.props.msg : false}
            </div>
        );
    }
}
// Log in screen
interface ILoginProps {
    logIn:(event: React.MouseEvent<HTMLElement,MouseEvent>, username: string, password: string) => void;
}
interface ILoginState {
    [key: string]: string;
}
class LogIn extends React.Component<ILoginProps,ILoginState> {
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
        const logIn = (event: React.MouseEvent<HTMLElement>, username: string, password: string) => {
            this.setState({username:'',password:''});
            this.props.logIn(event,username,password)
        }
        return (
            <form>
                <h1>Log In</h1>
                <input 
                    name="username"
                    value={this.state.username}
                    onChange={this.handleInputChange}
                    type="text" 
                    placeholder="Username"
                />
                <input 
                    name="password"
                    value={this.state.password}
                    onChange={this.handleInputChange}
                    type="Password" 
                    placeholder="Password"
                />
                <button onClick={(event) => logIn(event,this.state.username,this.state.password)}>Log In</button>
            </form>
            
        )
    }
}
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

ReactDOM.render(<App />,document.getElementById('root'));