import mongoose from "mongoose";
const commentSchema = new mongoose.Schema.ObjectId(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    content: {
      type: String,
      maxlength: 280,
      required: true,
    },
    Like: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  { timestamps: true }
);
const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
