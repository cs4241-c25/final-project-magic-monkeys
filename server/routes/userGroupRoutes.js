import express from "express";
import { addUserToGroup, getUserGroupById, checkGroupJoinExists, updateUserRole, removeUserFromGroup } from "../controllers/userGroupController.js";

const router = express.Router();

router.post("/user-groups", addUserToGroup);
router.get("/user-groups/:id", getUserGroupById);
router.get("/user-groups/check/:userId/:groupId", checkGroupJoinExists);
router.put("/user-groups/:id", updateUserRole);
router.delete("/user-groups/:id", removeUserFromGroup);

export default router;