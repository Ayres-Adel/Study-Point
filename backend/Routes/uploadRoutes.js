import express from "express";
import { verifyToken } from "../middleware/tokenMiddleware.js";
import { uploadDocument } from "../Controllers/uploadControllers.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/", verifyToken, upload.single("file"), uploadDocument);

export default router;
