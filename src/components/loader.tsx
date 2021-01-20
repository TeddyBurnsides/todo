// core imports
import React from 'react';

// Generic component to dsplay message while waiting for response from server
interface LoaderProps {
    displayFlag:boolean;
    msg?:string;
}
export class Loader extends React.Component<LoaderProps> {
    render() {
        return (
            <div>
                {this.props.displayFlag ? this.props.msg : false}
            </div>
        );
    }
}