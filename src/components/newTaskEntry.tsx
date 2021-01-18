import React from 'react';

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
                <input type="text" name="taskText" value={this.state.taskText} onChange={this.handleInputChange} />
                <button onClick={(event) => addTask(event,this.state.taskText)}>Add Task</button>
            </form>
        );
    }
}

export default NewTaskEntry;