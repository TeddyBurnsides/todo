// core imports
import React from 'react';
// components
import {Task} from './task';
// interfaces
import {ITask} from './ITask';

// Build list of tasks
interface props {
    tasks:Array<ITask>;
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
    // Handle 0 tasks and >0 tasks
    const taskListContent = (taskList.length === 0) ? 'No tasks created yet!' : taskList;
    return <ul id="taskList">{taskListContent}</ul>
}