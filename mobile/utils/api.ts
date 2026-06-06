import { useAuth } from "@clerk/clerk-expo";
import axios, { AxiosInstance } from "axios";
import { API_BASE_URL } from "../config/api.config";

export const createApiClient = (
  getToken: () => Promise<string | null>,
): AxiosInstance => {
  const api = axios.create({ baseURL: API_BASE_URL });
  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  return api;
};

export const useApiClient = (): AxiosInstance => {
  const { getToken } = useAuth();
  return createApiClient(getToken);
};

export const userApi = {
  syncUser: (api: AxiosInstance) => api.post("/users/sync"),
  getCurrentUser: (api: AxiosInstance) => api.get("/users/me"),
  updateProfile: (api: AxiosInstance, data: any) =>
    api.put("/users/profile", data),
  followUser: (api: AxiosInstance, targetUserId: string) =>
    api.post(`/users/follow/${targetUserId}`),
  getFollowers: (api: AxiosInstance, userId: string) =>
    api.get(`/users/${userId}/followers`),
  getFollowing: (api: AxiosInstance, userId: string) =>
    api.get(`/users/${userId}/following`),
};

export const postApi = {
  createPost: (
    api: AxiosInstance,
    data: {
      content: string;
      image?: string;
    },
  ) => api.post("/posts", data),
  getPosts: (api: AxiosInstance) => api.get("/posts"),
  getUserPosts: (api: AxiosInstance, username: string) =>
    api.get(`/posts/user/${username}`),
  likePost: (api: AxiosInstance, postId: string) =>
    api.post(`/posts/${postId}/like`),
  deletePost: (api: AxiosInstance, postId: string) =>
    api.delete(`/posts/${postId}`),
};
export const commentApi = {
  createComment: (api: AxiosInstance, postId: string, content: string) =>
    api.post(`/comments/post/${postId}`, { content }),
  deleteComment: (api: AxiosInstance, commentId: string) =>
    api.delete(`/comments/${commentId}`),
};

export const messageApi = {
  getOrCreateConversation: (api: AxiosInstance, participantId: string) =>
    api.post("/messages/conversation", { participantId }),
  getConversations: (api: AxiosInstance) => api.get("/messages/conversations"),
  sendMessage: (api: AxiosInstance, conversationId: string, content: string) =>
    api.post(`/messages/${conversationId}`, { content }),
  getMessages: (api: AxiosInstance, conversationId: string) =>
    api.get(`/messages/${conversationId}`),
};
