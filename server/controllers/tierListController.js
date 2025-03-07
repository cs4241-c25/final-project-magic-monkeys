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
            return res.status(200).json([]);
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

export const bulkSaveTierList = async (req, res) => {
    try {
        /*
          Request body shape:
          {
            "userId": "someUserId",
            "tiers": {
              "S": { "items": [...] },
              "A": { "items": [...] },
              "B": { "items": [...] },
              "C": { "items": [...] },
              "D": { "items": [...] },
              "F": { "items": [...] },
              "U": { "items": [...] }
            }
          }
        */
        const { userId, tiers } = req.body;

        // Confirm user actually exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Delete old tier list entries for this user
        await TierList.deleteMany({ userId });

        // Now we include "U" in validRanks
        const validRanks = ["S", "A", "B", "C", "D", "F", "U"];

        let results = [];

        for (const rank of validRanks) {
            if (!tiers[rank]) continue; // If no items for that rank, skip

            const items = tiers[rank].items || [];
            for (let i = 0; i < items.length; i++) {
                const movie = items[i];
                const movieId = Number(movie.id);

                // Create a new TierList doc
                const newEntry = await TierList.create({
                    userId: user._id,
                    movieId,
                    rank, // "S", "A", ..., or "U"
                    order: i
                });
                results.push(newEntry);
            }
        }

        res.status(200).json({
            message: "Tier list saved successfully.",
            data: results
        });
    } catch (error) {
        console.error("bulkSaveTierList error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
