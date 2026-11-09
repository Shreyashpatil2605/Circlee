import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  deleteNotification,
  getNotification,
  markNotificationRead,
  markAllNotificationsRead,
  createInternalNotification,
  createReactionNotification,
  createMessageNotification,
  markMessageNotificationsRead,
  registerPushToken,
  deregisterPushToken,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protectRoute, getNotification);
router.post("/internal-create", createInternalNotification);
router.post("/reaction", protectRoute, createReactionNotification);
router.post("/message", protectRoute, createMessageNotification);
router.put("/read-all", protectRoute, markAllNotificationsRead);
router.put("/read-conversation", protectRoute, markMessageNotificationsRead);
router.put("/:notificationId/read", protectRoute, markNotificationRead);
router.delete("/:notificationId", protectRoute, deleteNotification);

// Push Token registration/deregistration
router.post("/push-token", protectRoute, registerPushToken);
router.delete("/push-token", protectRoute, deregisterPushToken);

export default router;
