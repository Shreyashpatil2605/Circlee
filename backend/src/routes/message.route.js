import express from "express";
import {
  getOrCreateConversation,
  getConversations,
  sendMessage,
  getMessages,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected routes (require authentication)
router.post("/conversation", protectRoute, getOrCreateConversation);
router.get("/conversations", protectRoute, getConversations);
router.post("/:conversationId", protectRoute, sendMessage);
router.get("/:conversationId", protectRoute, getMessages);

export default router;
