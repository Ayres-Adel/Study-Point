import express from "express";
import { verifyToken } from "../middleware/tokenMiddleware.js";
import { addPoints, getPointsHistory } from "../Controllers/pointsControllers.js";

const router = express.Router();

router.post("/add", verifyToken, addPoints);
router.post("/history", verifyToken, getPointsHistory);

export default router;
