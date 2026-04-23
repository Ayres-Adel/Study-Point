import express from "express";
import { verifyToken } from "../middleware/tokenMiddleware.js";
import {
    generateExam,
    generateQuiz,
    submitExam,
    submitQuiz,
    listQuizzes,
    getQuiz
} from "../Controllers/assessmentControllers.js";

const router = express.Router();

router.post("/quiz/generate", verifyToken, generateQuiz);
router.post("/quiz/submit", verifyToken, submitQuiz);
router.post("/quiz/list", verifyToken, listQuizzes);
router.post("/quiz/:id", verifyToken, getQuiz);
router.post("/exam/generate", verifyToken, generateExam);
router.post("/exam/submit", verifyToken, submitExam);

export default router;
