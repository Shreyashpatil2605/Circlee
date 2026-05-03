import { useAuth } from "@clerk/clerk-expo";
import axios, { AxiosInstance } from "axios";
const API_BASE_URL = "https://circlee-two.vercel.app/";
export const createApiClient = (
  getToken: () => Promise<String | null>,
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
  syncUser: (api: AxiosInstance) => api.post("/user/sync"),
  getUser: (api: AxiosInstance) => api.get("?users/me"),
  updateUser: (api: AxiosInstance, data: any) => api.put("/users/profile",data),
};

// export const userapi = {
//   syncUser: (api: AxiosInstance) => api.post("/users/sync"),
//   getCurrentUser: (api: AxiosInstance) => api.get("/users/me"),
//   updateProfile: (api: AxiosInstance, data: any) => api.put("/users/sync"),
// };
