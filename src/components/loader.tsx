// core imports
import React from 'react';

// Generic component to dsplay message while waiting for response from server
interface props {
    displayFlag:boolean;
    msg?:string;
}
export const Loader = (props: props) => {
    const visibleClass = (props.displayFlag) ? 'visible' : '';
    return (
        <div className="notification">
            <span className={visibleClass}>
                {props.msg}
            </span>
        </div>
    );
}