import { useRef, useMemo } from "react";
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
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  return useMemo(() => {
    const stableGetToken = () => getTokenRef.current();
    return createApiClient(stableGetToken);
  }, []);
};

export const userApi = {
  syncUser: (api: AxiosInstance) => api.post("/users/sync"),
  getCurrentUser: (api: AxiosInstance) => api.get("/users/me"),
  getUserProfile: (api: AxiosInstance, username: string) =>
    api.get(`/users/profile/${username}`),
  updateProfile: (api: AxiosInstance, data: any) =>
    api.put("/users/profile", data),
  followUser: (api: AxiosInstance, targetUserId: string) =>
    api.post(`/users/follow/${targetUserId}`),
  getFollowers: (api: AxiosInstance, userId: string) =>
    api.get(`/users/${userId}/followers`),
  getFollowing: (api: AxiosInstance, userId: string) =>
    api.get(`/users/${userId}/following`),
  getSuggestedUsers: (api: AxiosInstance) => api.get("/users/suggested"),
  searchUsers: (api: AxiosInstance, query: string) =>
    api.get(`/users/search?q=${encodeURIComponent(query)}`),

  updatePresence: (api: AxiosInstance, isOnline: boolean) =>
    api.put("/users/presence", {
      isOnline,
    }),
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
  getSavedPosts: (api: AxiosInstance) => api.get("/posts/saved"),
  getUserPosts: (api: AxiosInstance, username: string) =>
    api.get(`/posts/user/${username}`),
  likePost: (api: AxiosInstance, postId: string) =>
    api.post(`/posts/${postId}/like`),
  resharePost: (api: AxiosInstance, postId: string) =>
    api.post(`/posts/${postId}/reshare`),
  savePost: (api: AxiosInstance, postId: string) =>
    api.post(`/posts/${postId}/save`),
  deletePost: (api: AxiosInstance, postId: string) =>
    api.delete(`/posts/${postId}`),
};
export const commentApi = {
  createComment: (api: AxiosInstance, postId: string, content: string) =>
    api.post(`/comments/post/${postId}`, { content }),
  deleteComment: (api: AxiosInstance, commentId: string) =>
    api.delete(`/comments/${commentId}`),
};
