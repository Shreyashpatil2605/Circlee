export interface User {
  _id: string;
  clerkId?: string;
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
  savedPosts?: string[];
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
  reshares?: (string | User)[];
  comments: Comment[];
}

export enum NotificationType {
  LIKE = "LIKE",
  COMMENT = "COMMENT",
  FOLLOW = "FOLLOW",
  MESSAGE = "MESSAGE",
  VOICE_MESSAGE = "VOICE_MESSAGE",
  RESHARE = "RESHARE",
  REACTION = "REACTION",
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
  messageId?: string;
  content?: string;
  messagePreview?: string;
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

export interface MessageReaction {
  emoji: string;
  userId: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: number;
  readBy?: string[];
  type?: string;
  audioUrl?: string;
  attachments?: {
    type: string;
    url: string;
    metadata?: any;
  }[];
  deletedForEveryone?: boolean;
  deletedFor?: string[];
  reactions?: MessageReaction[];
  sender?: {
    id: string;
    clerkId: string;
    firstName: string;
    lastName: string;
    username: string;
    profilePicture?: string;
  } | null;
}
