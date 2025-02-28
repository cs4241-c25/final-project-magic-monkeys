import express from "express";
import { createWatchList, getWatchListById, getWatchListByUser, getWatchedByUser, updateWatchList, deleteWatchList } from "../controllers/watchListController.js";

const router = express.Router();

router.post("/watch-lists", createWatchList);
router.get("/watch-lists/:id", getWatchListById);
router.get("/users/:userId/watch-lists", getWatchListByUser);
router.get("/users/:userId/watched-movies", getWatchedByUser);
router.put("/watch-lists/:id", updateWatchList);
router.delete("/watch-lists/:id", deleteWatchList);

export default router;