import express from "express";
import { createMovieNightAttendee, getMovieNightAttendeeById, updateMovieNightAttendee, deleteMovieNightAttendee } from "../controllers/movieNightAttendeeController.js";

const router = express.Router();

router.post("/movie-night-attendees", createMovieNightAttendee);
router.get("/movie-night-attendees/:id", getMovieNightAttendeeById);
router.put("/movie-night-attendees/:id", updateMovieNightAttendee);
router.delete("/movie-night-attendees/:id", deleteMovieNightAttendee);

export default router;