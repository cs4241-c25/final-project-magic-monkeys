import MovieNight from "../models/MovieNight.js";
import UserGroup from "../models/UserGroups.js";
import MovieNightAttendee from "../models/MovieNightAttendee.js";
import Group from "../models/Group.js";

export const createMovieNight = async (req, res) => {
    try {
        const { groupId, movieId, dateTime } = req.body;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found." });
        }

        const newMovieNight = new MovieNight({ groupId, movieId, dateTime });
        await newMovieNight.save();

        res.status(201).json(newMovieNight);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getMovieNightById = async (req, res) => {
    try {
        const { id } = req.params;
        const movieNight = await MovieNight.findById(id).populate("groupId");

        if (!movieNight) {
            return res.status(404).json({ message: "Movie night not found." });
        }

        res.status(200).json(movieNight);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getMovieNightsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const userGroups = await UserGroup.find({ userId }).select("groupId");
        if (!userGroups.length) {
            return res.status(404).json({ message: "User is not in any groups." });
        }

        const groupIds = userGroups.map(ug => ug.groupId);

        const movieNights = await MovieNight.find({ groupId: { $in: groupIds } });

        res.status(200).json(movieNights);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getMovieNightsByGroup = async (req, res) => {
    try {
        const { groupId } = req.params;

        const movieNights = await MovieNight.find({ groupId });

        if (!movieNights.length) {
            return res.status(404).json({ message: "No movie nights found for this group." });
        }

        res.status(200).json(movieNights);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getMovieNightAttendance = async (req, res) => {
    try {
        const { id } = req.params;

        const attendees = await MovieNightAttendee.find({ movieNightId: id }).populate(
            "userId",
            "username email profilePicture"
        );

        res.status(200).json(attendees);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateMovieNight = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedMovieNight = await MovieNight.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedMovieNight) {
            return res.status(404).json({ message: "Movie night not found." });
        }

        res.status(200).json(updatedMovieNight);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteMovieNight = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedMovieNight = await MovieNight.findByIdAndDelete(id);
        if (!deletedMovieNight) {
            return res.status(404).json({ message: "Movie night not found." });
        }

        await MovieNightAttendee.deleteMany({ movieNightId: id });

        res.status(200).json({ message: "Movie night deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};