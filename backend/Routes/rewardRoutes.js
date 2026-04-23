import express from "express";
import { verifyToken } from "../middleware/tokenMiddleware.js";
import { redeemReward } from "../Controllers/rewardsControllers.js";

const router = express.Router();

router.post("/redeem", verifyToken, redeemReward);

export default router;
