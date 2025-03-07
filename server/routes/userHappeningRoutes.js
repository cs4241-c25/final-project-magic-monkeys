import express from "express";
import { createUserHappening, getUserHappeningById, getUserHappeningsByUser, getUserHappeningsByGroup, getAllUsersGroupHappenings, deleteUserHappening } from "../controllers/userHappeningController.js";

const router = express.Router();

router.post("/user-happenings", createUserHappening);
router.get("/user-happenings/:id", getUserHappeningById);
router.get("/users/:userId/user-happenings", getUserHappeningsByUser);
router.get("/groups/:groupId/user-happenings", getUserHappeningsByGroup);
router.get("/users-groups/:userId/user-happenings", getAllUsersGroupHappenings)
router.delete("/user-happenings/:id", deleteUserHappening);

export default router;