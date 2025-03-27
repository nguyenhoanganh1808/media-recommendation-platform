import axios from "axios";
import { setupInterceptors } from "./api";

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.example.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Setup interceptors for token refresh
setupInterceptors(api);

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    username?: string;
    avatar?: string;
    createdAt?: string;
  };
  accessToken: string;
  refreshToken: string;
}

// For demo purposes, we'll simulate API calls
export const loginUser = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  try {
    // In a real app, this would be:
    // const response = await api.post("/auth/login", credentials);
    // return response.data;

    // Simulated API response for demo
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate validation
        if (
          credentials.email === "demo@example.com" &&
          credentials.password === "password"
        ) {
          resolve({
            user: {
              id: "user-123",
              name: "Demo User",
              email: "demo@example.com",
              username: "demouser",
              createdAt: new Date().toISOString(),
            },
            accessToken: "simulated-access-token",
            refreshToken: "simulated-refresh-token",
          });
        } else {
          reject(new Error("Invalid email or password"));
        }
      }, 1000); // Simulate network delay
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
    throw error;
  }
};

export const registerUser = async (
  credentials: RegisterCredentials
): Promise<AuthResponse> => {
  try {
    const response = await api.post("/auth/register", credentials);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
    throw error;
  }
};

export const refreshAuthToken = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    // In a real app, this would be:
    const response = await api.post("/auth/refresh-token", { refreshToken });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Token refresh failed");
    }
    throw error;
  }
};

export const getUserProfile = async (): Promise<any> => {
  try {
    const response = await api.get("/auth/profile");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user profile"
      );
    }
    throw error;
  }
};
