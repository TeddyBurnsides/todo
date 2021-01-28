// core imports
import React from 'react';
// components
import {CompleteTaskButton} from './completeTaskButton';
// interfaces
import {ITask} from './ITask';

// Individual Task
interface TaskProps {
    key: string;
    task: ITask;
    deleteTask:(id: string) => void;
    completeTask:(id: string, status:boolean) => void;
    saveTask:(event: React.MouseEvent<HTMLElement,MouseEvent>, id: string, newTitle: string, dueDate: string) => void;
}
interface TaskState {
    editMode:boolean;
    title: string;
}
export class Task extends React.Component<TaskProps,TaskState> {
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
            document.querySelector('#blur').classList.toggle('visible');
        }
        // wrapper that allows us to call server routine and update local state
        const saveTask = async (event: React.MouseEvent<HTMLElement,MouseEvent>, id: string, title: string, dueDate: string) => {
            // call server function in parent component (allows state to be updated)
            this.props.saveTask(event,id,title,dueDate);
            // disable editing mode
            toggleEditMode();
        }
        // cancel out of the task editor
        const cancelTask = (event: React.MouseEvent<HTMLElement,MouseEvent>) => {
            // prevent page refresh
            event.preventDefault();
            // reset fields back to original values before editing
            this.setState({title:this.props.task.title});
            // edit mode
            toggleEditMode();
        }
        // delete task wrapper 
        const deleteTask  = (event: React.MouseEvent<HTMLElement,MouseEvent>, id:string) => {
            // prevent page refresh
            event.preventDefault();
            // edit mode
            toggleEditMode();
            // call main funcrion
            this.props.deleteTask(id);
        }
        // get date to be readable
        const userReadableDate = (date: number) => {
            if (date == null) return '';
            if (date === 0) return '';
            let dateObject = new Date(date)
            const monthNames = ["January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"
];
            const month = monthNames[dateObject.getMonth()];
            const day = dateObject.getDate();
            const year = dateObject.getFullYear();
            return day + " " + month + " " + year;
        }
        // convert string to format readable by date input
        const inputReadableDate = (date:number) => {
            const dateObject = new Date(date);
            const year = dateObject.getFullYear();
            const month = dateObject.getMonth();
            const day = dateObject.getDate();
            return pad(year,4) + "-" + pad(month+1,2) + "-" + pad(day,2)
        }
        // pad input with zeros to padLength
        const pad = (input:string|number, padLength:number) => {
            const pad_char = '0';
            const pad = new Array(1 + padLength).join(pad_char);
            return (pad + input).slice(-pad.length);
        }
        // build a CSS class name for completed tasks
        const taskClass = this.props.task.complete ? 'completed' : '';

        // if tasks are in edit mode
        if (this.state.editMode) {
            return (
                <li className={`task ${taskClass}`}>
                    <form className="editForm">
                        <input type="text" value={this.state.title} onChange={this.handleInputChange} />
                        <div className="details">
                            <label>Due Date:</label>
                            <input 
                                type="date" 
                                value={inputReadableDate(this.props.task.dueDate)}
                                />
                            <div className="clear"></div>
                        </div>
                        <button className="saveButton" onClick={(event) => saveTask(event,id,this.state.title,'12-12-2000')}>Save</button>
                        <button className="cancelButton" onClick={(event) => cancelTask(event)}>Cancel</button>
                        <button className="deleteButton" onClick={(event) => deleteTask(event,id)}>Delete</button>
                        
                        <div className="clear"></div>
                    </form>           
                </li>    
            );

        // if task is in read-only mode   
        } else {
            
            return (
                <li className={`task ${taskClass}`}>        
                    <CompleteTaskButton 
                        complete={this.props.task.complete} 
                        id={id} 
                        completeTask={this.props.completeTask}
                    />
                    <span className="title">{this.props.task.title}</span>
                    <span className="date">{userReadableDate(this.props.task.dueDate)}</span>
                    <button className="options" onClick={() => toggleEditMode()}></button>
                    <div className="clear"></div>
                </li>
            );
        }  
    }
}