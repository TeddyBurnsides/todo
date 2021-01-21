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
        return (    
            <button className="completeButton" onClick={() => this.props.completeTask(this.props.id,this.props.complete)}>✓</button>
        )
        
    }
}