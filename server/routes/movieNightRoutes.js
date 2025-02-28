import express from "express";
import { createMovieNight, getMovieNightById, getMovieNightsByUser, getMovieNightsByGroup, getMovieNightAttendance, updateMovieNight, deleteMovieNight } from "../controllers/movieNightController.js";

const router = express.Router();

router.post("/movie-nights", createMovieNight);
router.get("/movie-nights/:id", getMovieNightById);
router.get("/users/:userId/movie-nights", getMovieNightsByUser);
router.get("/groups/:groupId/movie-nights", getMovieNightsByGroup);
router.get("/movie-nights/:id/attendance", getMovieNightAttendance);
router.put("/movie-nights/:id", updateMovieNight);
router.delete("/movie-nights/:id", deleteMovieNight);

export default router;