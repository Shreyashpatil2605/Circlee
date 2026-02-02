import express from "express";
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  getUsersPosts,
} from "../controllers/post.controller";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = expree.Router();
// public routes
router.get("/", getPosts);
router.get("/:postId", getPost);
router.get("/user/:username", getUsersPosts);

// protected routes: u should be autheticated to use these routes
router.post("/", protectRoute, upload.single("image"), createPost);
router.post("/:postId/like", protectRoute, likePost);
router.post("/:postId", protectRoute, deletePost);

export default router;
