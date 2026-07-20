import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  deleteNotification,
  getNotification,
  markNotificationRead,
  markAllNotificationsRead,
  createInternalNotification,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protectRoute, getNotification);
router.post("/internal-create", createInternalNotification);
router.put("/read-all", protectRoute, markAllNotificationsRead);
router.put("/:notificationId/read", protectRoute, markNotificationRead);
router.delete("/:notificationId", protectRoute, deleteNotification);

export default router;

