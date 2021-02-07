// core imports
import React, {useState} from 'react';
// components
import {Task} from './task';
// interfaces
import {ITask} from './ITask';

// Build list of tasks
interface props {
    tasks:Array<ITask>;
    loadingStatus:boolean;
    deleteTask:(id: string) => void;
    completeTask:(id: string, status:boolean) => void;
    saveTask:(event: React.MouseEvent<HTMLElement,MouseEvent>, id: string, newTitle: string, dueDate: number) => void;
}
export const TaskList = (props: props) => {    

    //initialize state
    const [statusFilter,setStatusFilter] = useState<boolean | null>(null);
    const [dateFilter,setDateFilter] = useState<number | null>(null);

    // get today's date (or today + offset) in pure number format
    const today = (offset:number = 0) => {
        const today = new Date();
        const dd = String(today.getDate()+offset).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        const yyyy = today.getFullYear();
        const dateString = mm + '/' + dd + '/' + yyyy;
        return Date.parse(dateString)
    }

    // build list of components from array
    let taskList = props.tasks.filter((task) => {
        if (statusFilter === null) {
            return true;
        } else {
            return task.complete === statusFilter;
        }
    }).filter((task) => {
        if (dateFilter === null) {
            return true;
        } else {
            return task.dueDate === dateFilter;
        }
    }).map((task:ITask) => {
        return(
            <Task 
                key={task._id.toString()}
                task={task}
                deleteTask={props.deleteTask}
                completeTask={props.completeTask}
                saveTask={props.saveTask}
            />
        );
    }).reverse(); // puts most recent task on top

    // handle 0 tasks and >0 tasks
    if (taskList.length === 0) {
        return (
            <div>
                <div id="filters">
                    <div className="group">
                        <button className={`${(statusFilter===true) ? 'active' : ''}`} onClick={() => setStatusFilter(true)}>Complete</button>
                        <button className={`${(statusFilter===false) ? 'active' : ''}`} onClick={() => setStatusFilter(false)}>Incomplete</button>
                        <button className={`${(statusFilter===null) ? 'active' : ''}`} onClick={() => setStatusFilter(null)}>All</button>
                    </div>
                    <div className="group">
                    <button 
                            className={`${(dateFilter===today(1)) ? 'active' : '' }`} 
                            onClick={() => setDateFilter(today(1))}
                        >Tomorrow</button> 
                        <button 
                            className={`${(dateFilter===today()) ? 'active' : '' }`} 
                            onClick={() => setDateFilter(today())}
                        >Today</button>
                        <button 
                            className={`${(dateFilter===null) ? 'active' : '' }`}
                            onClick={() => setDateFilter(null)}
                        >Any</button>
                        
                    </div>
                </div>
                <div className="clear"></div>
                <div className="loadingText">No tasks</div>;
            </div>
        );
    } else {
        return (
            <div>
                <div id="filters">
                    <div className="group">
                        <button className={`${(statusFilter===true) ? 'active' : ''}`} onClick={() => setStatusFilter(true)}>Complete</button>
                        <button className={`${(statusFilter===false) ? 'active' : ''}`} onClick={() => setStatusFilter(false)}>Incomplete</button>
                        <button className={`${(statusFilter===null) ? 'active' : ''}`} onClick={() => setStatusFilter(null)}>All</button>
                    </div>
                    <div className="group">
                    <button 
                            className={`${(dateFilter===today(1)) ? 'active' : '' }`} 
                            onClick={() => setDateFilter(today(1))}
                        >Tomorrow</button> 
                        <button 
                            className={`${(dateFilter===today()) ? 'active' : '' }`} 
                            onClick={() => setDateFilter(today())}
                        >Today</button>
                        <button 
                            className={`${(dateFilter===null) ? 'active' : '' }`}
                            onClick={() => setDateFilter(null)}
                        >Any</button>
                        
                    </div>
                </div>
                <div className="clear"></div>
                <ul id="taskList">{taskList}</ul>
            </div>
        );
    }
}