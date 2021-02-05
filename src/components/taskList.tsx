// core imports
import React from 'react';
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
    let taskList = props.tasks.map((task:ITask) => {
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
    if (props.loadingStatus == true) {
        return <div className="loadingText">Loading posts...</div>
    } else {
        if (taskList.length === 0) {
            return <div className="loadingText">No tasks created yet!</div>;
        } else {
            return <ul id="taskList">{taskList}</ul>
        }
    }
}