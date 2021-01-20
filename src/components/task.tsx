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
        if (this.state.editMode) {
            return (
                <li>
                    <form>
                        <input type="text" value={this.state.title} onChange={this.handleInputChange} />
                        <button onClick={(event) => saveTask(event,id,this.state.title)}>Save</button>
                    </form>           
                </li>    
            );
        } else {
            return (
                <li>
                    {this.props.task.title}
                    <CompleteTaskButton 
                        complete={this.props.task.complete} 
                        id={id} 
                        completeTask={this.props.completeTask}
                    />
                    <button onClick={() => toggleEditMode()}>Edit</button>
                    <button onClick={() => this.props.deleteTask(id)}>Delete</button>
                </li>
            );
        }  
    }
}