import express from "express";
import { createTierList, getTierListById, getTierListByUser, updateTierList, deleteTierList } from "../controllers/tierListController.js";

const router = express.Router();

router.post("/tier-lists", createTierList);
router.get("/tier-lists/:id", getTierListById);
router.get("/users/:userId/tier-lists", getTierListByUser);
router.put("/tier-lists/:id", updateTierList);
router.delete("/tier-lists/:id", deleteTierList);

export default router;