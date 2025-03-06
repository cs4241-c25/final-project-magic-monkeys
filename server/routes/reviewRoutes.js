import express from "express";
import {
    createReview,
    getReviewById,
    getReviewsByUser,
    updateReview,
    deleteReview,
    getGroupMovieAverageRating
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/reviews", createReview);
router.get("/reviews/:id", getReviewById);
router.get("/users/:userId/reviews", getReviewsByUser);
router.get("/groups/:groupId/movies/:movieId/average-rating", getGroupMovieAverageRating);
router.put("/reviews/:id", updateReview);
router.delete("/reviews/:id", deleteReview);

export default router;