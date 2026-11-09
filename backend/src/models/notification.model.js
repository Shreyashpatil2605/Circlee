import mongoose from "mongoose";

export const NotificationType = {
  LIKE: "LIKE",
  COMMENT: "COMMENT",
  FOLLOW: "FOLLOW",
  MESSAGE: "MESSAGE",
  VOICE_MESSAGE: "VOICE_MESSAGE",
  RESHARE: "RESHARE",
  REACTION: "REACTION",
};

const notificationSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(NotificationType),
    },
    targetType: {
      type: String,
      required: true,
      enum: ["Post", "Comment", "Profile", "Conversation"],
    },
    targetId: {
      type: String,
      required: true,
    },
    messageId: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      default: null,
    },
    messagePreview: {
      type: String,
      default: null,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
    pushSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
