import React, { useState, useRef } from 'react';
import { BsTicketFill, BsTicket } from "react-icons/bs";
import '../styles/TicketRating.css';

/**
 * TicketRating component for displaying and setting movie ratings
 */
export const TicketRating = ({
                                 rating = 0,
                                 maxRating = 5,
                                 interactive = false,
                                 onChange = () => {},
                                 size = 'md',
                                 color = '#ff4b4b',
                                 variant = 'default' // variant prop: 'default', 'simple', or 'condensed'
                             }) => {
    const [hoverRating, setHoverRating] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const inputRef = useRef(null);

    const getSizeClass = () => {
        switch(size) {
            case 'sm': return 'ticket-sm';
            case 'lg': return 'ticket-lg';
            default: return 'ticket-md';
        }
    };

    const handleClick = (newRating) => {
        if (!interactive) return;

        onChange(newRating);
    };

    const handleMouseEnter = (index) => {
        if (interactive) {
            setHoverRating(index);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(0);
        }
    };

    const handleValueClick = () => {
        if (!interactive ) return;

        setIsEditing(true);
        setEditValue((hoverRating || rating || 0).toFixed(2));

        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.select();
            }
        }, 10);
    };

    const handleInputChange = (e) => {
        const value = e.target.value.replace(/[^0-9.]/g, '');
        setEditValue(value);
    };

    const handleInputBlur = () => {
        finishEditing();
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            finishEditing();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };

    const finishEditing = () => {
        if (!isEditing) return;

        let newValue = parseFloat(editValue);

        if (isNaN(newValue)) {
            newValue = rating || 0;
        } else {
            newValue = Math.max(0, Math.min(maxRating, newValue));
            newValue = Math.round(newValue * 100) / 100;
        }

        onChange(newValue);
        setIsEditing(false);
    };

    const renderTickets = () => {
        const tickets = [];
        const currentRating = hoverRating || rating || 0;

        for (let i = 1; i <= maxRating; i++) {
            const isFilled = i <= currentRating;

            tickets.push(
                <div
                    key={i}
                    className={`ticket-icon ${interactive ? 'interactive' : ''}`}
                    onClick={() => handleClick(i)}
                    onMouseEnter={() => handleMouseEnter(i)}
                >
                    {isFilled ?
                        <BsTicketFill style={{ color }} /> :
                        <BsTicket style={{ opacity: 0.35 }} />
                    }
                </div>
            );
        }

        return tickets;
    };

    return (
        <div className={`ticket-rating-wrapper ${interactive ? 'interactive' : ''} ${variant === 'condensed' ? 'condensed' : ''}`}>
            <div
                className={`ticket-rating ${getSizeClass()} ${variant}`}
                onMouseLeave={handleMouseLeave}
            >
                {renderTickets()}

                {/*{condensed && (*/}
                {/*    <div className="ticket-value">*/}
                {/*        {(hoverRating || rating || 0).toFixed(0)} / {maxRating.toFixed(0)}*/}
                {/*    </div>*/}
                {/*)}*/}
                {variant !== 'condensed' && (

                    isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            className="ticket-value-input"
                            value={editValue}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            onKeyDown={handleInputKeyDown}
                            maxLength={4}
                        />
                    ) : (
                        <div
                            className={`ticket-value ${interactive ? 'editable' : ''}`}
                            onClick={interactive ? handleValueClick : undefined}
                        >
                            {(hoverRating || rating || 0).toFixed(2)} / {maxRating.toFixed(0)}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};