import React from 'react';

// Generic component to dsplay message while waiting for response from server
interface ILoaderProps {
    displayFlag:boolean;
    msg?:string;
}
class Loader extends React.Component<ILoaderProps> {
    render() {
        return (
            <div>
                {this.props.displayFlag ? this.props.msg : false}
            </div>
        );
    }
}

export default Loader;