export interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  bannerImage?: string;
  bio?: string;
  location?: string;
  followers?: string[];
  following?: string[];
  createdAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  user: User;
}

export interface Post {
  _id: string;
  content: string;
  image?: string;
  createdAt: string;
  user: User;
  likes: string[];
  comments: Comment[];
}

export enum NotificationType {
  LIKE = "LIKE",
  COMMENT = "COMMENT",
  FOLLOW = "FOLLOW",
  MESSAGE = "MESSAGE",
  VOICE_MESSAGE = "VOICE_MESSAGE",
}

export interface Notification {
  _id: string;
  from: {
    clerkId: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  to: string;
  type: NotificationType;
  targetType: "Post" | "Comment" | "Profile" | "Conversation";
  targetId: string;
  post?: {
    _id: string;
    content: string;
    image?: string;
  };
  comment?: {
    _id: string;
    content: string;
  };
  read: boolean;
  pushSent: boolean;
  createdAt: string;
}
