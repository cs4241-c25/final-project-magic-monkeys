import React from 'react';

export const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content bg-gray-900 border border-gray-800"
                onClick={e => e.stopPropagation()}
            >
                <button
                    className="modal-close"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    ×
                </button>
                {children}
            </div>
        </div>
    );
};