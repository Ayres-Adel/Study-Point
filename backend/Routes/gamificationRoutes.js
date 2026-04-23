import express from "express";
import { verifyToken } from "../middleware/tokenMiddleware.js";
import { checkStreak, getLeaderboard } from "../Controllers/pointsControllers.js";

const router = express.Router();

router.post("/leaderboard", verifyToken, getLeaderboard);
router.post("/streak/check", verifyToken, checkStreak);

export default router;
