// core imports
import React, {useState} from 'react';

// new task entry form
interface props {
    addTask:(event: React.MouseEvent<HTMLElement,MouseEvent>, taskTitle: string, dueDate: string) => void;
}
export const NewTaskEntry = (props: props) => {

    // initialize state
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    
    // wrapper for main add Task function
    const addTask = (event: React.MouseEvent<HTMLElement>,taskTitle: string, dueDate: string) => {
        // reset state
        setTitle('');
        setDueDate('');
        // call main function
        props.addTask(event,taskTitle,dueDate);
    }

    return (
        <form id="newTaskEntry">
            <input 
                placeholder="Enter new task..." 
                type="text" 
                name="title" 
                value={title} 
                onChange={event => setTitle(event.target.value)}
            />
            <button onClick={(event) => addTask(event,title,dueDate)}></button>
            <div className="details">
                <label>Due Date:</label>
                <input 
                    type="date" 
                    name="dueDate"
                    value={dueDate}
                    onChange={event => setDueDate(event.target.value)}
                />
                <div className="clear"></div>
            </div>
            <div className="clear"></div>
        </form>
    );
    
}