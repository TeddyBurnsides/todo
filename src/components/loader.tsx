// core imports
import React from 'react';

// Generic component to dsplay message while waiting for response from server
interface LoaderProps {
    displayFlag:boolean;
    msg?:string;
}
export class Loader extends React.Component<LoaderProps> {
    render() {
        if (this.props.displayFlag) {
            return (
                <div className="notification">
                    <span className="visible">
                        {this.props.msg}
                    </span>
                </div>
            );
        } else {
            return (
                <div className="notification">
                    <span></span>
                </div>
            );
        }
        
    }
}