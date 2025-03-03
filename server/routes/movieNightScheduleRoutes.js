import express from "express";
import { createMovieNightSchedule, getMovieNightScheduleById, getMovieNightScheduleByUser, getMovieNightScheduleByGroup, updateMovieNightSchedule, deleteMovieNightSchedule } from "../controllers/movieNightScheduleController.js";

const router = express.Router();

router.post("/movie-night-schedules", createMovieNightSchedule);
router.get("/movie-night-schedules/:id", getMovieNightScheduleById);
router.get("/users/:userId/movie-night-schedules", getMovieNightScheduleByUser);
router.get("/groups/:groupId/movie-night-schedules", getMovieNightScheduleByGroup);
router.put("/movie-night-schedules/:id", updateMovieNightSchedule);
router.delete("/movie-night-schedules/:id", deleteMovieNightSchedule);

export default router;