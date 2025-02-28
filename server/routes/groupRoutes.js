import express from "express";
import { createGroup, getGroupById, getGroupMembers, updateGroup, deleteGroup } from "../controllers/groupController.js";

const router = express.Router();

router.post("/groups", createGroup);
router.get("/groups/:id", getGroupById);
router.get("/groups/:id/members", getGroupMembers);
router.put("/groups/:id", updateGroup);
router.delete("/groups/:id", deleteGroup);

export default router;