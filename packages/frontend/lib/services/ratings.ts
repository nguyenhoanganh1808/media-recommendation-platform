import axios from "axios";
import type { Rating } from "@/lib/features/ratings/ratingsSlice";
import { api } from "./api";

interface RatingsResponse {
  data: Rating[];
  meta: {
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

// Create a new rating
export const createRating = async (
  mediaId: string,
  rating: number
): Promise<Rating> => {
  try {
    const response = await api.post("/api/ratings", { mediaId, rating });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to create rating"
      );
    }
    throw error;
  }
};

// Update an existing rating
export const updateRating = async (
  ratingId: string,
  rating: number
): Promise<Rating> => {
  try {
    const response = await api.put(`/api/ratings/${ratingId}`, { rating });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to update rating"
      );
    }
    throw error;
  }
};

// Delete a rating
export const deleteRating = async (ratingId: string): Promise<void> => {
  try {
    await api.delete(`/api/ratings/${ratingId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to delete rating"
      );
    }
    throw error;
  }
};

// Get user ratings
export const getUserRatings = async (
  page = 1,
  limit = 10
): Promise<RatingsResponse> => {
  try {
    const response = await api.get(
      `/api/ratings/me?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user ratings"
      );
    }
    throw error;
  }
};

// Get ratings for a specific media
export const getMediaRatings = async (
  mediaId: string,
  page = 1,
  limit = 10
): Promise<RatingsResponse> => {
  try {
    const response = await api.get(
      `/api/ratings/media/${mediaId}?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch media ratings"
      );
    }
    throw error;
  }
};

// Get a specific rating
export const getRating = async (ratingId: string): Promise<Rating> => {
  try {
    const response = await api.get(`/api/ratings/${ratingId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch rating"
      );
    }
    throw error;
  }
};
