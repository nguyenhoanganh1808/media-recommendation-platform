import axios from "axios";
import type { Review } from "@/lib/features/reviews/reviewsSlice";
import { api } from "./api";

interface ReviewsResponse {
  data: Review[];
  meta: {
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

// Create a new review
export const createReview = async (
  mediaId: string,
  content: string
): Promise<{ data: Review }> => {
  try {
    const response = await api.post("/reviews", { mediaId, content });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to create review"
      );
    }
    throw error;
  }
};

// Update an existing review
export const updateReview = async (
  reviewId: string,
  content: string
): Promise<{ data: Review }> => {
  try {
    const response = await api.put(`/reviews/${reviewId}`, { content });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to update review"
      );
    }
    throw error;
  }
};

// Delete a review
export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    await api.delete(`/api/reviews/${reviewId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to delete review"
      );
    }
    throw error;
  }
};

// Like/unlike a review
export const likeReview = async (
  reviewId: string,
  like: boolean
): Promise<{ data: Review }> => {
  try {
    const response = await api.post(`/api/reviews/${reviewId}/like`, { like });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to like review");
    }
    throw error;
  }
};

// Get reviews for a specific media
export const getMediaReviews = async (
  mediaId: string,
  page = 1,
  limit = 10
): Promise<ReviewsResponse> => {
  try {
    const response = await api.get(
      `/api/reviews/media/${mediaId}?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch media reviews"
      );
    }
    throw error;
  }
};

// Get reviews by a specific user
export const getUserReviews = async (
  userId: string,
  page = 1,
  limit = 10
): Promise<ReviewsResponse> => {
  try {
    const response = await api.get(
      `/api/reviews/user/${userId}?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user reviews"
      );
    }
    throw error;
  }
};

// Get a specific review by ID
export const getReviewById = async (
  reviewId: string
): Promise<{ data: Review }> => {
  try {
    const response = await api.get(`/api/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch review"
      );
    }
    throw error;
  }
};
