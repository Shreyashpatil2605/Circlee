import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import { clerkClient, getAuth } from "@clerk/express";
import Notification from "../models/notification.model.js";
import cloudinary from "../config/cloudinary.js";

// getUserProfile
export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username })
    .populate("followers", "username firstName lastName profilePicture")
    .populate("following", "username firstName lastName profilePicture");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json({ user });
});

// updateProfile
export const updateProfile = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { firstName, lastName, bio, location } = req.body;
  const files = req.files;

  const updateData = {
    ...(firstName && { firstName }),
    ...(lastName && { lastName }),
    ...(bio && { bio }),
    ...(location && { location }),
  };

  // Handle profile picture upload
  if (files?.profilePicture?.[0]) {
    try {
      const profilePictureFile = files.profilePicture[0];
      const base64Image = `data:${profilePictureFile.mimetype};base64,${profilePictureFile.buffer.toString("base64")}`;
      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "social_media_profiles/profile_pictures",
        resource_type: "image",
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto" },
          { format: "auto" },
        ],
      });
      updateData.profilePicture = uploadResponse.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary profile picture upload error:", uploadError);
      return res
        .status(400)
        .json({ error: "Failed to upload profile picture" });
    }
  }

  // Handle banner image upload
  if (files?.bannerImage?.[0]) {
    try {
      const bannerImageFile = files.bannerImage[0];
      const base64Image = `data:${bannerImageFile.mimetype};base64,${bannerImageFile.buffer.toString("base64")}`;
      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "social_media_profiles/banner_images",
        resource_type: "image",
        transformation: [
          { width: 1200, height: 400, crop: "fill" },
          { quality: "auto" },
          { format: "auto" },
        ],
      });
      updateData.bannerImage = uploadResponse.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary banner image upload error:", uploadError);
      return res.status(400).json({ error: "Failed to upload banner image" });
    }
  }

  const user = await User.findOneAndUpdate({ clerkId: userId }, updateData, {
    new: true,
  });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.status(200).json({ user });
});

export const syncUser = asyncHandler(async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized - no user ID found",
      });
    }

    const clerkUser = await clerkClient.users.getUser(userId);

    if (!clerkUser.emailAddresses || clerkUser.emailAddresses.length === 0) {
      return res.status(400).json({
        error: "User has no email address",
      });
    }

    const email = clerkUser.emailAddresses[0].emailAddress;

    // Check by clerkId OR email
    let existingUser = await User.findOne({
      $or: [{ clerkId: userId }, { email: email }],
    });

    if (existingUser) {
      // Update clerkId if account was recreated in Clerk
      if (existingUser.clerkId !== userId) {
        existingUser.clerkId = userId;
        await existingUser.save();

        console.log("Updated existing user with new Clerk ID:", userId);
      }

      return res.status(200).json({
        user: existingUser,
        message: "User already exists",
      });
    }

    let baseUsername = email.split("@")[0];
    let username = baseUsername;
    let counter = 1;

    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    const userData = {
      clerkId: userId,
      email,
      firstName: clerkUser.firstName || "",
      lastName: clerkUser.lastName || "",
      username,
      profilePicture: clerkUser.imageUrl || "",
    };

    const user = await User.create(userData);

    return res.status(201).json({
      user,
      message: "User Created Successfully",
    });
  } catch (error) {
    console.error("Error in syncUser:", error);
    throw error;
  }
});

// getCurrentUser
export const getCurrentUser = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const user = await User.findOne({ clerkId: userId })
    .populate("followers", "username firstName lastName profilePicture")
    .populate("following", "username firstName lastName profilePicture");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({ user });
});

// followUser
export const followUser = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { targetUserId } = req.params;
  if (userId === targetUserId) {
    return res.status(400).json({ message: "User cannot follow yourself" });
  }
  const currentUser = await User.findOne({ clerkId: userId });
  const targetUser = await User.findById(targetUserId);
  if (!currentUser || !targetUser) {
    return res.status(404).json({ message: "User not found" });
  }
  const isFollowing = currentUser.following.includes(targetUserId);
  if (isFollowing) {
    //unfollow
    await User.findByIdAndUpdate(currentUser._id, {
      $pull: { following: targetUserId },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUser._id },
    });
  } else {
    //Follow
    await User.findByIdAndUpdate(currentUser._id, {
      $push: { following: targetUserId },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $push: { followers: currentUser._id },
    });
    await Notification.create({
      from: currentUser._id,
      to: targetUserId,
      type: "follow",
    });
  }

  // Fetch updated user data
  const updatedUser = await User.findById(currentUser._id)
    .populate("followers", "username firstName lastName profilePicture")
    .populate("following", "username firstName lastName profilePicture");

  res.status(200).json({
    message: isFollowing ? "User unfollowed" : "User followed",
    isFollowing: !isFollowing,
    user: updatedUser,
  });
});

// getFollowers
export const getFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId).populate(
    "followers",
    "username firstName lastName profilePicture",
  );
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.status(200).json({ followers: user.followers });
});

// getFollowing
export const getFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId).populate(
    "following",
    "username firstName lastName profilePicture",
  );
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.status(200).json({ following: user.following });
});
export const updatePresence = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);

  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    {
      isOnline: req.body.isOnline,
      lastSeen: new Date(),
    },
    { new: true },
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    isOnline: user.isOnline,
    lastSeen: user.lastSeen,
  });
});
