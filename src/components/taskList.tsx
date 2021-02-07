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

    // build list of components from array
    let taskList = props.tasks.filter((task) => {
        if (statusFilter === null) {
            return true;
        } else {
            return task.complete === statusFilter;
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

    // Handle 3 scenarios:
    // 0 tasks, loading tasks, and >0 tasks
    if (props.loadingStatus === true) {
        return <div className="loadingText">Loading posts...</div>
    } else {
        if (taskList.length === 0) {
            return <div className="loadingText">No tasks created yet!</div>;
        } else {
            return (
                <div>
                    <div id="filters">
                        <button className={`${(statusFilter===true) ? 'active' : ''}`} onClick={() => setStatusFilter(true)}>Complete</button>
                        <button className={`${(statusFilter===false) ? 'active' : ''}`} onClick={() => setStatusFilter(false)}>Incomplete</button>
                        <button className={`${(statusFilter===null) ? 'active' : ''}`} onClick={() => setStatusFilter(null)}>All</button>
                    </div>
                    <div className="clear"></div>
                    <ul id="taskList">{taskList}</ul>
                </div>
            );
        }
    }
}