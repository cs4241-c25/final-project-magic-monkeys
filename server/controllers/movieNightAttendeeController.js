import MovieNightAttendee from "../models/MovieNightAttendee.js";
import MovieNight from "../models/MovieNight.js";
import User from "../models/User.js";

export const createMovieNightAttendee = async (req, res) => {
    try {
        const { movieNightId, userId, status } = req.body;

        const movieNight = await MovieNight.findById(movieNightId);
        if (!movieNight) {
            return res.status(404).json({ message: "Movie night not found." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const existingAttendee = await MovieNightAttendee.findOne({ movieNightId, userId });
        if (existingAttendee) {
            return res.status(400).json({ message: "User is already an attendee for this movie night." });
        }

        const newAttendee = new MovieNightAttendee({ movieNightId, userId, status });
        await newAttendee.save();

        res.status(201).json(newAttendee);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getMovieNightAttendeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const attendee = await MovieNightAttendee.findById(id)
            .populate("userId", "username email profilePicture")
            .populate("movieNightId");

        if (!attendee) {
            return res.status(404).json({ message: "Attendee not found." });
        }

        res.status(200).json(attendee);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateMovieNightAttendee = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["Attended", "Absent"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value." });
        }

        const updatedAttendee = await MovieNightAttendee.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedAttendee) {
            return res.status(404).json({ message: "Attendee not found." });
        }

        res.status(200).json(updatedAttendee);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteMovieNightAttendee = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAttendee = await MovieNightAttendee.findByIdAndDelete(id);

        if (!deletedAttendee) {
            return res.status(404).json({ message: "Attendee not found." });
        }

        res.status(200).json({ message: "Attendee removed successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};