// core imports
import React from 'react';

// new task entry form
interface NewTaskEntryProps {
    addTask:(event: React.MouseEvent<HTMLElement,MouseEvent>, taskTitle: string, dueDate: string) => void;
}
interface NewTaskEntryState {
    taskText: string,
    dueDate?: string
}
export class NewTaskEntry extends React.Component<NewTaskEntryProps,NewTaskEntryState> {
    constructor(props:any) {
        super(props);
        this.state = {
            taskText: '',
            dueDate: ''
        }
        this.handleTitleChange = this.handleTitleChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
    }
    // update state when input field is edited
    handleTitleChange({target}: {target:HTMLInputElement}) {
        this.setState({
            taskText: target.value
        });
    }

    handleDateChange({target}: {target:HTMLInputElement}) {
        this.setState({
            dueDate: target.value
        });
    }
    
    render() {
        // handle showing/hiding details pane
        /*const showDetails = () => {
            let detailsPane = document.querySelector<HTMLElement>('#newTaskEntry');
            detailsPane.classList.add('visibleDetails');
        }*/
        // clear local state (tied to input field) and call parent function to add task
        const addTask = (event: React.MouseEvent<HTMLElement>,taskTitle: string, dueDate: string) => {
            this.setState({taskText:'',dueDate:''}); // resets input field
            this.props.addTask(event,taskTitle,dueDate);
        }
        return (
            <form id="newTaskEntry">
                <input 
                    placeholder="Enter new task..." 
                    type="text" 
                    name="taskText" 
                    value={this.state.taskText} 
                    onChange={this.handleTitleChange}
                />
                <button onClick={(event) => addTask(event,this.state.taskText,this.state.dueDate)}></button>
                <div className="details">
                    <label>Due Date:</label>
                    <input 
                        type="date" 
                        name="dueDate"
                        value={this.state.dueDate}
                        onChange={this.handleDateChange}
                    />
                    <div className="clear"></div>
                </div>
                <div className="clear"></div>
            </form>
        );
    }
}