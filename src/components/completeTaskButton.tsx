// core imports
import React from 'react';

// Togglable task completion button
interface ICompleteButtonProps {
    complete:boolean;
    id: string;
    completeTask:(id: string, status: boolean) => void;
}
export class CompleteTaskButton extends React.Component<ICompleteButtonProps> {
    render() {
        // assign button text depending on completion status of task
        let buttonText = this.props.complete ? 'Uncomplete' : 'Complete';
        return (    
            <button onClick={() => this.props.completeTask(this.props.id,this.props.complete)}>{buttonText}</button>
        )
    }
}