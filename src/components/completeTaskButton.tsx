// core imports
import React from 'react';

// Togglable task completion button
interface props {
    complete:boolean;
    id: string;
    completeTask:(id: string, status: boolean) => void;
}
export const CompleteTaskButton = (props: props) => {
    return (    
        <button className="completeButton" onClick={() => props.completeTask(props.id,props.complete)}></button>
    )
}