import TierList from "../models/TierList.js";
import User from "../models/User.js";

export const createTierList = async (req, res) => {
    try {
        const { userId, movieId, rank, order } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const existingEntry = await TierList.findOne({ userId, movieId });
        if (existingEntry) {
            return res.status(400).json({ message: "Movie already exists in user's tier list." });
        }

        const newTierListEntry = new TierList({
            userId,
            movieId,
            rank,
            order
        });

        await newTierListEntry.save();
        res.status(201).json(newTierListEntry);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getTierListById = async (req, res) => {
    try {
        const { id } = req.params;
        const tierListEntry = await TierList.findById(id).populate("userId", "username profilePicture");

        if (!tierListEntry) {
            return res.status(404).json({ message: "Tier list entry not found." });
        }

        res.status(200).json(tierListEntry);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getTierListByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const tierList = await TierList.find({ userId }).sort({ order: 1 });

        if (!tierList.length) {
            return res.status(404).json({ message: "No tier list entries found for this user." });
        }

        res.status(200).json(tierList);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateTierList = async (req, res) => {
    try {
        const { id } = req.params;
        const { rank, order } = req.body;

        const updatedEntry = await TierList.findByIdAndUpdate(
            id,
            { rank, order },
            { new: true }
        );

        if (!updatedEntry) {
            return res.status(404).json({ message: "Tier list entry not found." });
        }

        res.status(200).json(updatedEntry);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteTierList = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEntry = await TierList.findByIdAndDelete(id);

        if (!deletedEntry) {
            return res.status(404).json({ message: "Tier list entry not found." });
        }

        res.status(200).json({ message: "Tier list entry deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
