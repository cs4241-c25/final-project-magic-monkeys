import React, { useState, useEffect } from "react";
import { Modal } from './Modal';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const MovieNightSchedulerModal = ({ isOpen, onClose, groupId, refreshData }) => {
    const [formData, setFormData] = useState({
        dateTime: "",
        recurring: false,
        recurrenceDays: [],
        startDate: "",
        endDate: "",
        startTime: "",
        duration: 120,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleRecurringDaysChange = (day) => {
        setFormData((prev) => {
            const newDays = prev.recurrenceDays.includes(day)
                ? prev.recurrenceDays.filter((d) => d !== day)
                : [...prev.recurrenceDays, day];
    
            return { ...prev, recurrenceDays: newDays };
        });
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();

        const convertTimeToISO = (timeString) => {
            if (!timeString) return null;
            const today = new Date();
            const [hours, minutes] = timeString.split(":");
            today.setHours(hours, minutes, 0, 0);
            return today.toISOString();
        };

        const formattedFormData = {
            ...formData,
            startTime: formData.recurring ? convertTimeToISO(formData.startTime) : null,
        };

        try {
            const response = await fetch(`${API_URL}/api/movie-night-schedules`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formattedFormData, groupId }),
            });

            if (response.ok) {
                refreshData();
                onClose();
            }
        } catch (error) {
            console.error("Error scheduling movie night:", error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="text-white p-6 rounded-lg w-full max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-center">Schedule a Movie Night</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Recurring Event Toggle */}
                    <div className="flex justify-center mb-4">
                        <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, recurring: !prev.recurring }))}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition bg-gray-700 text-gray-300 hover:bg-gray-600`}
                        >
                            {formData.recurring ? "Recurring Event" : "Non-Recurring Event"}
                        </button>
                    </div>

                    {!formData.recurring ? (
                        <div>
                            <label className="block mb-1 text-sm">Date & Time</label>
                            <input
                                type="datetime-local"
                                name="dateTime"
                                value={formData.dateTime}
                                onChange={handleChange}
                                className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    ) : (
                        <>
                            {/* Recurring Days Selection */}
                            <div>
                                <label className="block mb-1 text-sm text-center">Select Recurring Days</label>
                                <div className="flex justify-between gap-1">
                                    {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => {
                                        const isSelected = formData.recurrenceDays.includes(day);

                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => handleRecurringDaysChange(day)}
                                                className={`w-10 h-10 text-sm font-medium rounded-full transition-all duration-200 
                                                    ${isSelected ? "bg-blue-500 text-white shadow-md" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                                            >
                                                {day.slice(0, 3)} {/* Show short version (Mon, Tue, etc.) */}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1 text-sm">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm">Start Time</label>
                                <input
                                    type="time"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block mb-1 text-sm">Duration (minutes)</label>
                        <input
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            min="1"
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded transition"
                        >
                            Schedule
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};