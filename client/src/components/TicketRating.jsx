import React, { useState, useRef, useEffect } from 'react';
import { BsTicketFill, BsTicket } from "react-icons/bs";
import '../styles/TicketRating.css';

/**
 * TicketRating component for displaying and setting movie ratings
 *
 * Currently very finicky when it comes to 'sliding', so the granulairty is also finicky.
 */
export const TicketRating = ({
                                 rating = 0,
                                 maxRating = 5,
                                 interactive = false,
                                 onChange = () => {},
                                 size = 'md',
                                 color = '#ff4b4b'
                             }) => {
    const [hoverRating, setHoverRating] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const ticketsContainerRef = useRef(null);

    // Get appropriate CSS class based on size prop
    const getSizeClass = () => {
        switch(size) {
            case 'sm': return 'ticket-sm';
            case 'lg': return 'ticket-lg';
            default: return 'ticket-md';
        }
    };

    // Handle click event for interactive mode on specific ticket
    const handleClick = (newRating) => {
        if (interactive) {
            onChange(newRating);
        }
    };

    // Handle mouse enter for interactive mode
    const handleMouseEnter = (index) => {
        if (interactive && !isDragging) {
            setHoverRating(index);
        }
    };

    // Reset hover rating when mouse leaves
    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(0);
        }
    };

    // Handle mouse down to start dragging
    const handleMouseDown = (e) => {
        if (interactive && ticketsContainerRef.current) {
            setIsDragging(true);
            updateRatingFromPosition(e);
        }
    };

    // Update rating based on mouse position
    const updateRatingFromPosition = (e) => {
        if (ticketsContainerRef.current) {
            const rect = ticketsContainerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;

            let newRating = (x / width) * maxRating;
            newRating = Math.max(0, Math.min(maxRating, newRating));
            // THIS IS WHERE CHANGE TO 2 DECIMALS
            newRating = Math.round(newRating * 10) / 10;

            onChange(newRating);
        }
    };

    useEffect(() => {
        const handleDocumentMouseMove = (e) => {
            if (isDragging) {
                updateRatingFromPosition(e);
            }
        };

        const handleDocumentMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
            }
        };

        if (interactive) {
            document.addEventListener('mousemove', handleDocumentMouseMove);
            document.addEventListener('mouseup', handleDocumentMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleDocumentMouseMove);
                document.removeEventListener('mouseup', handleDocumentMouseUp);
            };
        }
    }, [isDragging, interactive]);

    const renderTickets = () => {
        const tickets = [];
        const currentRating = hoverRating || rating || 0;

        for (let i = 1; i <= maxRating; i++) {
            const fillPercentage = Math.max(0, Math.min(1, currentRating - (i - 1)));
            const isFilled = fillPercentage > 0;

            tickets.push(
                <div
                    key={i}
                    className={`ticket-icon ${interactive ? 'interactive' : ''} ${isDragging ? 'dragging' : ''}`}
                    onClick={() => handleClick(i)}
                    onMouseEnter={() => handleMouseEnter(i)}
                    style={{ color: isFilled ? color : 'inherit' }}
                >
                    {isFilled ? <BsTicketFill /> : <BsTicket />}
                </div>
            );
        }

        return tickets;
    };

    return (
        <div className={`ticket-rating-wrapper ${interactive ? 'interactive' : ''}`}>
            <div
                ref={ticketsContainerRef}
                className={`ticket-rating ${getSizeClass()} ${interactive ? 'slider-enabled' : ''}`}
                onMouseLeave={handleMouseLeave}
                onMouseDown={interactive ? handleMouseDown : undefined}
            >
                {renderTickets()}
                {interactive && (
                    <div className="ticket-value">
                        {(hoverRating || rating || 0).toFixed(1)}/{maxRating.toFixed(1)}
                    </div>
                )}
            </div>
        </div>
    );
};