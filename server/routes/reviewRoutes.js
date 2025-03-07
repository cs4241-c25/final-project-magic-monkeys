import express from "express";
import { createReview, getReviewById, getReviewsByUser, updateReview, deleteReview } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/reviews", createReview);
router.get("/reviews/:id", getReviewById);
router.get("/users/:userId/reviews", getReviewsByUser);
//router.get("/groups/:groupId/movies/:movieId/average-rating", getGroupAverageMovieReview);
router.put("/reviews/:id", updateReview);
router.delete("/reviews/:id", deleteReview);

export default router;