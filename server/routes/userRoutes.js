import express from "express";
import { createUser, getUsers, getUserById, getUserByAuth0Id, getUserGroups, updateUser, deleteUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/users", createUser);
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.get("/users/auth0/:auth0Id", getUserByAuth0Id)
router.get("/users/:id/groups", getUserGroups);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;