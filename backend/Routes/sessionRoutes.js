import express from "express";
import { verifyToken } from "../middleware/tokenMiddleware.js";
import {
    createStudySession,
    listSessionMessages,
    listStudySessions,
    sendSessionMessage,
    deleteStudySession,
    updateStudySessionDocument
} from "../Controllers/sessionControllers.js";

const router = express.Router();

router.post("/create", verifyToken, createStudySession);
router.post("/list", verifyToken, listStudySessions);
router.post("/messages/list", verifyToken, listSessionMessages);
router.post("/messages/send", verifyToken, sendSessionMessage);
router.post("/delete", verifyToken, deleteStudySession);
router.post("/update-doc", verifyToken, updateStudySessionDocument);

export default router;
