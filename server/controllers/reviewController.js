import Review from "../models/Review.js";
import User from "../models/User.js";
import UserGroup from "../models/UserGroups.js";

export const createReview = async (req, res) => {
    try {
        const { userId, movieId, rating, reviewText } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const existingReview = await Review.findOne({ userId, movieId });
        if (existingReview) {
            return res.status(400).json({ message: "User has already reviewed this movie." });
        }

        const newReview = new Review({
            userId,
            movieId,
            rating,
            reviewText,
        });

        await newReview.save();
        res.status(201).json(newReview);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id).populate("userId", "username profilePicture");

        if (!review) {
            return res.status(404).json({ message: "Review not found." });
        }

        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getReviewsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const reviews = await Review.find({ userId });

        if (!reviews.length) {
            return res.status(404).json({ message: "No reviews found for this user." });
        }

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getGroupMovieAverageRating = async (req, res) => {
    try {
        const { groupId, movieId } = req.params;

        const userGroups = await UserGroup.find({ groupId }).select("userId");
        if (!userGroups.length) {
            return res.status(404).json({ message: "No members found in this group." });
        }

        const userIds = userGroups.map(ug => ug.userId);

        const reviews = await Review.find({ movieId, userId: { $in: userIds } });

        if (!reviews.length) {
            return res.status(404).json({ message: "No reviews found for this movie by group members." });
        }

        const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRatings / reviews.length;

        res.status(200).json({ averageRating: averageRating.toFixed(2), reviewCount: reviews.length });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, reviewText } = req.body;

        if (rating !== undefined && (rating < 0 || rating > 5)) {
            return res.status(400).json({ message: "Rating must be between 0 and 5." });
        }

        const updatedReview = await Review.findByIdAndUpdate(
            id,
            { rating, reviewText },
            { new: true }
        );

        if (!updatedReview) {
            return res.status(404).json({ message: "Review not found." });
        }

        res.status(200).json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReview = await Review.findByIdAndDelete(id);

        if (!deletedReview) {
            return res.status(404).json({ message: "Review not found." });
        }

        res.status(200).json({ message: "Review deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
