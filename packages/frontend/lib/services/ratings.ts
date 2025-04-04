import axios from "axios";
import type {
  Rating,
  RatingResponse,
  Review,
  ReviewsParams,
} from "@/lib/features/ratings/ratingsSlice";
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

// Submit a rating
export const submitRating = async (
  mediaId: string,
  rating: number
): Promise<RatingResponse> => {
  try {
    // In a real app, this would be:
    const response = await api.post("/ratings", { mediaId, rating });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to submit rating"
      );
    }
    throw error;
  }
};

// Fetch user's rating for a media
export const fetchUserRating = async (
  mediaId: string
): Promise<{ data: Rating[] }> => {
  try {
    const response = await api.get(`/ratings/me?mediaId=${mediaId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user rating"
      );
    }
    throw error;
  }
};

// Delete a rating
export const deleteRating = async (mediaId: string): Promise<void> => {
  try {
    await api.delete(`/ratings?mediaId=${mediaId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to delete rating"
      );
    }
    throw error;
  }
};

// Submit a review
export const submitReview = async (
  mediaId: string,
  content: string,
  containsSpoilers: boolean,
  isPublic: boolean
): Promise<Review> => {
  try {
    // In a real app, this would be:
    // const response = await api.post("/api/reviews", { mediaId, content, containsSpoilers, isPublic });
    // return response.data;

    // Simulated API response for demo
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `review-${Date.now()}`,
          userId: "user-123", // Current user ID
          mediaId,
          content,
          containsSpoilers,
          isPublic,
          likesCount: 0,
          isLikedByUser: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: {
            id: "user-123",
            name: "Demo User",
            username: "demouser",
            avatar: "/placeholder.svg?height=100&width=100",
          },
          rating: {
            score: 8, // Assuming the user has rated this media
          },
        });
      }, 700); // Simulate network delay
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to submit review"
      );
    }
    throw error;
  }
};

// Fetch user's review for a media
export const fetchUserReview = async (mediaId: string): Promise<Review> => {
  try {
    // In a real app, this would be:
    // const response = await api.get(`/api/reviews/user?mediaId=${mediaId}`);
    // return response.data;

    // Simulated API response for demo
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate a 30% chance of having a review
        if (Math.random() > 0.7) {
          resolve({
            id: `review-${Date.now()}`,
            userId: "user-123", // Current user ID
            mediaId,
            content:
              "This is my review of this media. I found it very entertaining and would recommend it to others who enjoy this genre.",
            containsSpoilers: false,
            isPublic: true,
            likesCount: Math.floor(Math.random() * 50),
            isLikedByUser: false,
            createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), // 14 days ago
            updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
            user: {
              id: "user-123",
              name: "Demo User",
              username: "demouser",
              avatar: "/placeholder.svg?height=100&width=100",
            },
            rating: {
              score: 8, // Assuming the user has rated this media
            },
          });
        } else {
          reject(new Error("Review not found"));
        }
      }, 300); // Simulate network delay
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user review"
      );
    }
    throw error;
  }
};

// Fetch reviews for a media
export const fetchReviews = async (
  params: ReviewsParams
): Promise<ReviewsResponse> => {
  try {
    // In a real app, this would be:
    // const response = await api.get("/api/reviews", { params });
    // return response.data;

    // Simulated API response for demo
    return new Promise((resolve) => {
      setTimeout(() => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const totalItems = 25; // Simulate 25 total reviews

        // Generate mock reviews
        const reviews: Review[] = [];
        const count = Math.min(limit, totalItems - (page - 1) * limit);

        for (let i = 0; i < count; i++) {
          const hasRating = !params.filterRated || Math.random() > 0.3;
          const hasSpoilers = Math.random() > 0.7;

          // Skip reviews with spoilers if hideSpoilers is true
          if (params.hideSpoilers && hasSpoilers) {
            continue;
          }

          const reviewId = `review-${(page - 1) * limit + i + 1}`;
          const userId = `user-${200 + i}`;
          const isCurrentUser = i === 0 && page === 1; // First review on first page is from current user

          reviews.push({
            id: reviewId,
            userId: isCurrentUser ? "user-123" : userId,
            mediaId: params.mediaId,
            content: isCurrentUser
              ? "This is my review of this media. I found it very entertaining and would recommend it to others who enjoy this genre."
              : `This is review ${(page - 1) * limit + i + 1} for this media. ${hasSpoilers ? "SPOILER ALERT: The main character survives in the end!" : "It was a great experience overall."}`,
            containsSpoilers: hasSpoilers,
            isPublic: true,
            likesCount: Math.floor(Math.random() * 50),
            isLikedByUser: Math.random() > 0.7,
            createdAt: new Date(Date.now() - 86400000 * (i + 1)).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * i).toISOString(),
            user: {
              id: isCurrentUser ? "user-123" : userId,
              name: isCurrentUser ? "Demo User" : `User ${200 + i}`,
              username: isCurrentUser ? "demouser" : `user${200 + i}`,
              avatar: "/placeholder.svg?height=100&width=100",
            },
            rating: hasRating
              ? {
                  score: Math.floor(Math.random() * 10) + 1, // Random score between 1-10
                }
              : undefined,
          });
        }

        // Sort reviews based on sortBy parameter
        if (params.sortBy) {
          switch (params.sortBy) {
            case "newest":
              reviews.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              );
              break;
            case "oldest":
              reviews.sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              );
              break;
            case "highestRated":
              reviews.sort(
                (a, b) => (b.rating?.score || 0) - (a.rating?.score || 0)
              );
              break;
            case "lowestRated":
              reviews.sort(
                (a, b) => (a.rating?.score || 0) - (b.rating?.score || 0)
              );
              break;
            case "mostHelpful":
              reviews.sort((a, b) => b.likesCount - a.likesCount);
              break;
          }
        }

        resolve({
          data: reviews,
          meta: {
            pagination: {
              currentPage: page,
              totalPages: Math.ceil(totalItems / limit),
              totalItems,
              itemsPerPage: limit,
            },
          },
        });
      }, 800); // Simulate network delay
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch reviews"
      );
    }
    throw error;
  }
};

// Delete a review
export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    // In a real app, this would be:
    // await api.delete(`/api/reviews/${reviewId}`);

    // Simulated API response for demo
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500); // Simulate network delay
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to delete review"
      );
    }
    throw error;
  }
};

// Like a review
export const likeReview = async (reviewId: string): Promise<void> => {
  try {
    // In a real app, this would be:
    // await api.post(`/api/reviews/${reviewId}/like`);

    // Simulated API response for demo
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 300); // Simulate network delay
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to like review");
    }
    throw error;
  }
};

// Unlike a review
export const unlikeReview = async (reviewId: string): Promise<void> => {
  try {
    // In a real app, this would be:
    // await api.delete(`/api/reviews/${reviewId}/like`);

    // Simulated API response for demo
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 300); // Simulate network delay
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to unlike review"
      );
    }
    throw error;
  }
};
