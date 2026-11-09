import express from "express";
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  getSavedPosts,
  getUsersPosts,
  likePost,
  resharePost,
  savePost,
} from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// public routes
router.get("/", getPosts);
router.get("/saved", protectRoute, getSavedPosts);
router.get("/:postId", getPost);
router.get("/user/:username", getUsersPosts);

// protected routes
router.post("/", protectRoute, upload.single("image"), createPost);
router.post("/:postId/like", protectRoute, likePost);
router.post("/:postId/reshare", protectRoute, resharePost);
router.post("/:postId/save", protectRoute, savePost);
router.delete("/:postId", protectRoute, deletePost);

export default router;
