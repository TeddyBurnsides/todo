// core imports
import React, {useState} from 'react';
// components
import {CompleteTaskButton} from './completeTaskButton';
// interfaces
import {ITask} from './ITask';

// Individual Task
interface props {
    key: string;
    task: ITask;
    deleteTask:(id: string) => void;
    completeTask:(id: string, status:boolean) => void;
    saveTask:(event: React.MouseEvent<HTMLElement,MouseEvent>, id: string, newTitle: string, dueDate: number) => void;
}
export const Task = (props: props) => {

    // initialize state
    const [editMode, setEditMode] = useState(false);
    const [title, setTitle] = useState(props.task.title);
    const [dueDate, setDueDate] = useState(props.task.dueDate);

    // simplify task ID
    const id=props.task._id.toString();
    
    // toggle Edit Mode
    const toggleEditMode = () => {
        setEditMode(!editMode);
    }
    
    // main function wrapper
    const saveTask = async (event: React.MouseEvent<HTMLElement,MouseEvent>, id: string, title: string, dueDate: number) => {
        props.saveTask(event,id,title,dueDate);
        // disable editing mode
        toggleEditMode();
    }

    // cancel out of the task editor
    const cancelTask = (event: React.MouseEvent<HTMLElement,MouseEvent>) => {
        // prevent page refresh
        event.preventDefault();
        // reset fields back to original values before editing
        setTitle(props.task.title);
        setDueDate(props.task.dueDate);
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
        props.deleteTask(id);
    }

    // get date to be readable
    const userReadableDate = (date: number) => {
        // 0 means no date was stored
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

    // convert string to format readable by HTML date input
    const inputReadableDate = (date:number) => {
        // 0 means no date
        if (date===0) return '';
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
    const taskClass = props.task.complete ? 'completed' : '';

    // if tasks are in edit mode
    if (editMode) {
        return (
            <li className={`task ${taskClass}`}>
                <form className="editForm">
                    <input  
                        type="text" 
                        value={title} 
                        onChange={event => setTitle(event.target.value)}
                    />
                    <div className="details">
                        <label>Due Date:</label>
                        <input 
                            type="date" 
                            value={inputReadableDate(dueDate)}
                            onChange={event => setDueDate(Date.parse(event.target.value.replace(/-/g,"/")))}
                            />
                        <div className="clear"></div>
                    </div>
                    <button className="saveButton" onClick={(event) => saveTask(event,id,title,dueDate)}>Save</button>
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
                    complete={props.task.complete} 
                    id={id} 
                    completeTask={props.completeTask}
                />
                <span className="title">{props.task.title}</span>
                <span className="date">{userReadableDate(props.task.dueDate)}</span>
                <button className="options" onClick={() => toggleEditMode()}></button>
                <div className="clear"></div>
            </li>
        );
    }  
}