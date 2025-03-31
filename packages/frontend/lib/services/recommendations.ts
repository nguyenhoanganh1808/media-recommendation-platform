import axios from "axios";
import type { UserPreferences } from "@/lib/features/recommendations/recommendationsSlice";
import { api } from "./api";
import { MediaItem } from "../features/media/mediaSlice";

interface RecommendationResponse {
  data: MediaItem[];
  success: boolean;
  message: string | null;
}

// Fetch personalized recommendations
export const fetchPersonalizedRecommendations =
  async (): Promise<RecommendationResponse> => {
    try {
      const response = await api.get("/recommendations");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Failed to fetch personalized recommendations"
        );
      }
      throw error;
    }
  };

// Fetch trending media
export const fetchTrendingMedia = async (): Promise<RecommendationResponse> => {
  try {
    const response = await api.get("/recommendations/trending");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch trending media"
      );
    }
    throw error;
  }
};

// Fetch similar media
export const fetchSimilarMedia = async (
  mediaId: string
): Promise<RecommendationResponse> => {
  try {
    const response = await api.get(`/recommendations/media/${mediaId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch similar media"
      );
    }
    throw error;
  }
};

// Update user preferences
export const updateUserPreferences = async (
  preferences: UserPreferences
): Promise<void> => {
  try {
    await api.put("/recommendations/preferences", preferences);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to update preferences"
      );
    }
    throw error;
  }
};
