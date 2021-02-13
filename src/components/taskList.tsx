// core imports
import React, {useState} from 'react';
// components
import {Task} from './task';
import {Filters} from './filters';
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

    // build list of components from array
    // filters first on completion status, then due date
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
                <Filters
                    dateFilter={dateFilter}
                    statusFilter={statusFilter}
                    setDateFilter={setDateFilter}
                    setStatusFilter={setStatusFilter}
                />
                <div className="clear"></div>
                <div className="loadingText">No tasks</div>
            </div>
        );
    } else {
        return (
            <div>
                <Filters
                    dateFilter={dateFilter}
                    statusFilter={statusFilter}
                    setDateFilter={setDateFilter}
                    setStatusFilter={setStatusFilter}
                />
                <div className="clear"></div>
                <ul id="taskList">{taskList}</ul>
            </div>
        );
    }
}