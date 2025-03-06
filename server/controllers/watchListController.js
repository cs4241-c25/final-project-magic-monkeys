import WatchList from "../models/WatchList.js";
import User from "../models/User.js";

export const createWatchList = async (req, res) => {
    try {
        const { userId, movieId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const existingEntry = await WatchList.findOne({ userId, movieId });
        if (existingEntry) {
            return res.status(400).json({ message: "Movie is already in the watch list." });
        }

        const newEntry = new WatchList({ userId, movieId });
        await newEntry.save();

        res.status(201).json(newEntry);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getWatchListById = async (req, res) => {
    try {
        const { id } = req.params;
        const entry = await WatchList.findById(id).populate("userId", "username profilePicture");

        if (!entry) {
            return res.status(404).json({ message: "Watch list entry not found." });
        }

        res.status(200).json(entry);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getWatchListByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const watchList = await WatchList.find({ userId, seenMovie: false });

        if (!watchList.length) {
            return res.status(404).json({ message: "No movies found in this user's watch list." });
        }

        res.status(200).json(watchList);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getWatchedByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const watchedMovies = await WatchList.find({ userId, seenMovie: true });

        if (!watchedMovies.length) {
            return res.status(404).json({ message: "No watched movies found for this user." });
        }

        res.status(200).json(watchedMovies);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateWatchList = async (req, res) => {
    try {
        const { id } = req.params;
        const { seenMovie } = req.body;

        const updatedEntry = await WatchList.findByIdAndUpdate(
            id,
            { seenMovie },
            { new: true }
        );

        if (!updatedEntry) {
            return res.status(404).json({ message: "Watch list entry not found." });
        }

        res.status(200).json(updatedEntry);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteWatchList = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEntry = await WatchList.findByIdAndDelete(id);

        if (!deletedEntry) {
            return res.status(404).json({ message: "Watch list entry not found." });
        }

        res.status(200).json({ message: "Watch list entry deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteWatchListByUser = async (req, res) => {
    try {
        const { userId, movieId } = req.params;
        const deletedEntry = await WatchList.findOneAndDelete({ userId, movieId });

        if (!deletedEntry) {
            return res.status(404).json({ message: "Watch list entry not found." });
        }

        res.status(200).json({ message: "Watch list entry deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};