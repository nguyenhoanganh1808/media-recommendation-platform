import type { AxiosInstance } from "axios";
import { store } from "@/lib/store";
import { refreshToken, logout } from "@/lib/features/auth/authSlice";
import { refreshAuthToken } from "./auth";
import { getAuthFromStorage } from "@/lib/utils/storage";

export const setupInterceptors = (api: AxiosInstance) => {
  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      // First try to get token from Redux store
      let token = store.getState().auth.accessToken;

      // If not available in store, try localStorage
      if (!token) {
        const storedAuth = getAuthFromStorage();
        token = storedAuth.accessToken;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // If the error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // First try to get refresh token from Redux store
          let refreshTokenValue = store.getState().auth.refreshToken;

          // If not available in store, try localStorage
          if (!refreshTokenValue) {
            const storedAuth = getAuthFromStorage();
            refreshTokenValue = storedAuth.refreshToken;
          }

          if (!refreshTokenValue) {
            store.dispatch(logout());
            return Promise.reject(error);
          }

          // Get new tokens
          const tokens = await refreshAuthToken(refreshTokenValue);

          // Update store with new tokens
          store.dispatch(refreshToken(tokens));

          // Update the request with the new token
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;

          // Retry the request
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh token fails, logout user
          store.dispatch(logout());
          return Promise.reject(refreshError);
        }
      }

      // Handle rate limiting
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers["retry-after"] || 1;
        return new Promise((resolve) => {
          setTimeout(() => resolve(api(originalRequest)), retryAfter * 1000);
        });
      }

      return Promise.reject(error);
    }
  );
};
