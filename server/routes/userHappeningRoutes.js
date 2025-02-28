import express from "express";
import { createUserHappening, getUserHappeningById, getUserHappeningsByUser, deleteUserHappening } from "../controllers/userHappeningController.js";

const router = express.Router();

router.post("/user-happenings", createUserHappening);
router.get("/user-happenings/:id", getUserHappeningById);
router.get("/users/:userId/user-happenings", getUserHappeningsByUser);
router.delete("/user-happenings/:id", deleteUserHappening);

export default router;