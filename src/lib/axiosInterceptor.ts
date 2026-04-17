import axiosInstance from "../utils/axiosInstance";
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearAuthData,
} from "@/lib/authStorage";

const notifyAuthExpired = () => {
  clearAuthData();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:expired"));
  }
};

// Request interceptor - Add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    if (config.skipAuth) {
      return config;
    }

    const accessToken = getAccessToken();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh and errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Extract data from the standard API response format
    // If response has { success, statusCode, data } structure, return the data
    if (
      response.data &&
      "data" in response.data &&
      "success" in response.data
    ) {
      return {
        ...response,
        data: response.data.data, // Return just the data property
        originalData: response.data, // Keep original for reference if needed
      };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest?.skipAuth) {
      return Promise.reject(error);
    }

    // If error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          // No refresh token available, clear auth state and let the UI react.
          notifyAuthExpired();
          return Promise.reject(error);
        }

        // Try to refresh the access token
        const response = await axiosInstance.post(
          "/auth/refresh-token",
          {
            refreshToken,
          },
          {
            skipAuth: true,
          }
        );

        if (response.data && response.data.accessToken) {
          const { accessToken } = response.data;
          const currentRefresh = getRefreshToken();

          if (currentRefresh) {
            saveTokens(accessToken, currentRefresh);
          }

          // Update the Authorization header and retry the original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, clear auth state and let the UI react.
        console.error("Token refresh failed:", refreshError);
        notifyAuthExpired();
        return Promise.reject(refreshError);
      }
    }

    // Handle other error cases
    return Promise.reject(error);
  }
);

export default axiosInstance;
