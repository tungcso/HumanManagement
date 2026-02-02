import axios from "axios";
import { clearUser, getAT, setAT } from "./AuthToken";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://humanmanagement.onrender.com",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const accessToken = getAT();
  // config.validateStatus = (status: number) => {
  //   return status < 500;
  // };

  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let queue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const res = await api.post("/auth/refresh");
          const newAT = res.data.access_token;
          setAT(newAT);

          queue.forEach((p) => p.resolve(newAT));
          queue = [];
        } catch (e) {
          setAT(null);
          clearUser();
          queue.forEach((p) => p.reject(e));
          queue = [];
          return Promise.reject(e);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token: string) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
