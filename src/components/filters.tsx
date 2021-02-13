// core imports
import React from 'react';

interface props {
    dateFilter: number;
    statusFilter: boolean;
    setDateFilter: (value: React.SetStateAction<number>) => void;
    setStatusFilter: (value: React.SetStateAction<boolean>) => void;
}

export const Filters = (props: props) => {
    
    // get today's date (or today + offset) in pure number format
    const today = (offset:number = 0) => {
        const today = new Date();
        const dd = String(today.getDate()+offset).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        const yyyy = today.getFullYear();
        const dateString = mm + '/' + dd + '/' + yyyy;
        return Date.parse(dateString)
    }

    return (
        <div id="filters">
            <div className="group">
                <button className={`${(props.statusFilter===true) ? 'active' : ''}`} onClick={() => props.setStatusFilter(true)}>Complete</button>
                <button className={`${(props.statusFilter===false) ? 'active' : ''}`} onClick={() => props.setStatusFilter(false)}>Incomplete</button>
                <button className={`${(props.statusFilter===null) ? 'active' : ''}`} onClick={() => props.setStatusFilter(null)}>All</button>
            </div>
            <div className="group">
            <button 
                    className={`${(props.dateFilter===today(1)) ? 'active' : '' }`} 
                    onClick={() => props.setDateFilter(today(1))}
                >Tomorrow</button> 
                <button 
                    className={`${(props.dateFilter===today()) ? 'active' : '' }`} 
                    onClick={() => props.setDateFilter(today())}
                >Today</button>
                <button 
                    className={`${(props.dateFilter===null) ? 'active' : '' }`}
                    onClick={() => props.setDateFilter(null)}
                >Any</button>   
            </div>
        </div>
    );
}