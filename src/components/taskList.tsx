// components
import React from 'react';
import Task from './task';
// interfaces
import ITask from './ITask';

// Full task list (composed of many Task components)
interface ITaskListProps {
    tasks:Array<ITask>;
    deleteTask:(id: string) => void;
    completeTask:(id: string, status:boolean) => void;
    saveTask:(event: React.MouseEvent<HTMLElement,MouseEvent>, id: string, newTitle: string) => void;
}
class TaskList extends React.Component<ITaskListProps> {
    render() {    
        let taskList = this.props.tasks.map((task:ITask) => {
            return(
                <Task 
                    key={task._id.toString()}
                    task={task}
                    deleteTask={this.props.deleteTask}
                    completeTask={this.props.completeTask}
                    saveTask={this.props.saveTask}
                />
            );
        }).reverse(); // puts most recent task on top
        // if still loading tasks
        if (taskList.length === 0) {
            return <p>No tasks</p>
        // if not loading, and we have tasks
        } else {
            return <ul>{taskList}</ul>
        }
    }
}

export default TaskList;