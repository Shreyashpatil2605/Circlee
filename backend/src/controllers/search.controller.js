import expressAsyncHandler from "express-async-handler";
import User from "../models/user.model.js";

export const searchUsers = expressAsyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(200).json({ users: [] });
  }

  const users = await User.find({
    $or: [
      { username: { $regex: q, $options: "i" } },
      { firstName: { $regex: q, $options: "i" } },
      { lastName: { $regex: q, $options: "i" } },
    ],
  }).select(
    "username firstName lastName profilePicture"
  );

  res.status(200).json({ users });
});