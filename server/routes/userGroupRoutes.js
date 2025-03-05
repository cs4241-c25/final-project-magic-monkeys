import express from "express";
import { addUserToGroup, joinGroupByInvite, getUserGroupById, updateUserRole, removeUserFromGroup } from "../controllers/userGroupController.js";

const router = express.Router();

router.post("/user-groups", addUserToGroup);
router.post("/users/join-group", joinGroupByInvite);
router.get("/user-groups/:id", getUserGroupById);
router.put("/user-groups/:id", updateUserRole);
router.delete("/user-groups/:id", removeUserFromGroup);

export default router;