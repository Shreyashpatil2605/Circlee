import express from "express";
import { uploadMedia } from "../controllers/voiceUpload.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/audioUpload.middleware.js";

const router = express.Router();

router.post("/", protectRoute, upload.single("file"), uploadMedia);

export default router;
