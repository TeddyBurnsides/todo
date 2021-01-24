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
    saveTask:(event: React.MouseEvent<HTMLElement,MouseEvent>, id: string, newTitle: string) => void;
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
        }
        // wrapper that allows us to call server routine and update local state
        const saveTask = async (event: React.MouseEvent<HTMLElement,MouseEvent>, id: string, title: string) => {
            // call server function in parent component (allows state to be updated)
            this.props.saveTask(event,id,title);
            // disable editing mode
            toggleEditMode();
        }
        const taskClass = this.props.task.complete ? 'completed' : '';
        if (this.state.editMode) {
            return (
                <li className={`task ${taskClass}`}>
                    <CompleteTaskButton 
                        complete={this.props.task.complete} 
                        id={id} 
                        completeTask={this.props.completeTask}
                    />
                    <form className="editForm">
                        <input type="text" value={this.state.title} onChange={this.handleInputChange} />
                        <button onClick={(event) => saveTask(event,id,this.state.title)}>Save</button>
                    </form>           
                </li>    
            );
        } else {
            
            return (
                <li className={`task ${taskClass}`}>        
                    <CompleteTaskButton 
                        complete={this.props.task.complete} 
                        id={id} 
                        completeTask={this.props.completeTask}
                    />
                    <span className="title" onClick={() => toggleEditMode()}>{this.props.task.title}</span>
                    <span className="date">13 july 2020</span>
                    <button className="deleteButton" onClick={() => this.props.deleteTask(id)}>✕</button>
                    <div className="clear"></div>
                </li>
            );
        }  
    }
}