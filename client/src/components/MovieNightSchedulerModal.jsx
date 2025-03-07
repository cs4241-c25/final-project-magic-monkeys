import React, { useState, useEffect } from "react";
import { Modal } from './Modal';
import { useUser } from '../context/UserContext';
import "../styles/MovieNightSchedulerModal.css";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const MovieNightSchedulerModal = ({ isOpen, onClose, groupId, refreshData, movieNightSchedule }) => {
    const [formData, setFormData] = useState({
        dateTime: "",
        recurring: false,
        recurrenceDays: [],
        startDate: "",
        endDate: "",
        startTime: "",
        duration: "",
    });
    const { dbUser } = useUser();

    useEffect(() => {
        if(movieNightSchedule){
            const formatDateForInput = (isoString) => {
                if (!isoString) return "";
                const date = new Date(isoString);
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
            };
    
            const formatDateOnly = (isoString) => {
                if (!isoString) return "";
                const date = new Date(isoString);
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            };
    
            const formatTimeOnly = (isoString) => {
                if (!isoString) return "";
                const date = new Date(isoString);
                return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
            };

            setFormData({
                dateTime: movieNightSchedule.dateTime ? formatDateForInput(movieNightSchedule.dateTime) : "",
                recurring: movieNightSchedule.recurring || false,
                recurrenceDays: movieNightSchedule.recurrenceDays || [],
                startDate: movieNightSchedule.startDate ? formatDateOnly(movieNightSchedule.startDate) : "",
                endDate: movieNightSchedule.endDate ? formatDateOnly(movieNightSchedule.endDate) : "",
                startTime: movieNightSchedule.startTime ? formatTimeOnly(movieNightSchedule.startTime) : "",
                duration: movieNightSchedule.duration || "",
            });
        }
        else{
            setFormData({
                dateTime: "",
                recurring: false,
                recurrenceDays: [],
                startDate: "",
                endDate: "",
                startTime: "",
                duration: "",
            });
        }
    }, [movieNightSchedule, isOpen]);

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

        const convertToUTCDate = (dateString) => {
            if(!dateString) return null;
            const [year, month, day] = dateString.split("-").map(Number);
            return new Date(Date.UTC(year, month - 1, day + 1)).toISOString();
        };

        const convertTimeToISO = (timeString) => {
            if (!timeString) return null;
            const [hours, minutes] = timeString.split(":");
            const utcTime = new Date();
            utcTime.setHours(hours, minutes, 0, 0);
            return utcTime.toISOString();
        };

        const formattedFormData = {
            ...formData,
            startDate: convertToUTCDate(formData.startDate),
            endDate: formData.endDate ? convertToUTCDate(formData.endDate) : null,
            startTime: formData.recurring ? convertTimeToISO(formData.startTime) : null,
        };

        if(formData.duration === "") {
            delete formattedFormData.duration;
        }

        try {
            const requestOptions = {
                method: movieNightSchedule ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formattedFormData, groupId }),
            };

            const url = movieNightSchedule ?
                `${API_URL}/api/movie-night-schedules/${movieNightSchedule._id}` :
                `${API_URL}/api/movie-night-schedules`;
                

            const response = await fetch(url, requestOptions);

            if (response.ok) {
                const happening = `${dbUser.username} ${movieNightSchedule ? 'editted a' : 'created a new'} movie night.`

                await fetch(`${API_URL}/api/user-happenings`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: dbUser._id, happening })
                    }
                )

                refreshData();
                onClose();
            }
        } catch (error) {
            console.error("Error scheduling movie night:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`${API_URL}/api/movie-night-schedules/${movieNightSchedule._id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(),
            });

            if(response.ok) {
                const happening = `${dbUser.username} deleted a movie night.`

                await fetch(`${API_URL}/api/user-happenings`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: dbUser._id, happening })
                    }
                )

                refreshData();
                onClose();
            }
        } catch (error) {
            console.error('Error deleting group membership:', error);
            throw error;
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
                            className={`px-4 py-2 rounded-md text-sm font-medium transition salmon-bg hover-salmon`}
                        >
                            {formData.recurring ? "Recurring Event" : "One-Time Event"}
                        </button>
                    </div>

                    {/* One-Time Event Fields */}
                    {!formData.recurring ? (
                        <div>
                            <label className="block mb-1 text-sm">
                                Date & Time<span className="text-red-500 text-lg font-bold ml-1">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="dateTime"
                                value={formData.dateTime}
                                onChange={handleChange}
                                className="w-full p-2 rounded salmon-bg"
                                required
                            />
                        </div>
                    ) : (
                        <>
                            {/* Recurring Days Selection */}
                            <div>
                                <label className="block mb-1 text-sm text-center">
                                    Select Recurring Days<span className="text-red-500 text-lg font-bold ml-1">*</span>
                                </label>
                                <div className="flex justify-between gap-1">
                                    {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => {
                                        const isSelected = formData.recurrenceDays.includes(day);

                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => handleRecurringDaysChange(day)}
                                                className={`w-10 h-10 text-sm font-medium rounded-full transition-all duration-200 
                                                    ${isSelected ? "other-salmon-bg text-white shadow-md" : "salmon-bg hover-salmon"}`}
                                            >
                                                {day.slice(0, 3)} {/* Show short version (Mon, Tue, etc.) */}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* Start Date (Required) */}
                            <div>
                                <label className="block mb-1 text-sm">
                                    Start Date<span className="text-red-500 text-lg font-bold ml-1">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full p-2 rounded salmon-bg"
                                    required
                                />
                            </div>

                            {/* End Date (Optional) */}
                            <div>
                                <label className="block mb-1 text-sm">
                                    End Date <span className="text-gray-400">(Optional)</span>
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="w-full p-2 rounded salmon-bg"
                                />
                            </div>

                            {/* Start Time (Required) */}
                            <div>
                                <label className="block mb-1 text-sm">
                                    Start Time<span className="text-red-500 text-lg font-bold ml-1">*</span>
                                </label>
                                <input
                                    type="time"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    className="w-full p-2 rounded salmon-bg"
                                    required
                                />
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block mb-1 text-sm">
                            Duration (minutes) <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            min="1"
                            className="w-full p-2 rounded salmon-bg"
                            placeholder="Leave blank for no duration"
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
                        {movieNightSchedule && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded transition"
                            >
                                Delete
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded transition"
                        >
                            {movieNightSchedule ? 'Update' : 'Schedule'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};