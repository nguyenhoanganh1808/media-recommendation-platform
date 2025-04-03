import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createReview,
  updateReview,
  deleteReview,
  getMediaReviews,
  getUserReviews,
  getReviewById,
  likeReview,
} from "@/lib/services/reviews";
import type { RootState } from "@/lib/store";

export interface Review {
  id: string;
  userId: string;
  mediaId: string;
  content: string;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  media?: {
    id: string;
    title: string;
    mediaType: string;
    coverImage: string;
  };
}

interface ReviewsState {
  userReviews: Review[];
  mediaReviews: Record<string, Review[]>;
  currentReview: Review | null;
  userReviewsByMedia: Record<string, Review | null>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

const initialState: ReviewsState = {
  userReviews: [],
  mediaReviews: {},
  currentReview: null,
  userReviewsByMedia: {},
  status: "idle",
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
};

// Async thunks
export const fetchUserReviews = createAsyncThunk(
  "reviews/fetchUserReviews",
  async (
    {
      userId,
      page = 1,
      limit = 10,
    }: {
      userId: string;
      page?: number;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await getUserReviews(userId, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch user reviews"
      );
    }
  }
);

export const fetchMediaReviews = createAsyncThunk(
  "reviews/fetchMediaReviews",
  async (
    {
      mediaId,
      page = 1,
      limit = 10,
    }: {
      mediaId: string;
      page?: number;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await getMediaReviews(mediaId, page, limit);
      return { mediaId, ...response };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch media reviews"
      );
    }
  }
);

export const fetchReview = createAsyncThunk(
  "reviews/fetchReview",
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const response = await getReviewById(reviewId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch review"
      );
    }
  }
);

export const submitReview = createAsyncThunk(
  "reviews/submitReview",
  async (
    {
      mediaId,
      content,
    }: {
      mediaId: string;
      content: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await createReview(mediaId, content);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to submit review"
      );
    }
  }
);

export const editReview = createAsyncThunk(
  "reviews/editReview",
  async (
    {
      reviewId,
      content,
    }: {
      reviewId: string;
      content: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateReview(reviewId, content);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update review"
      );
    }
  }
);

export const removeReview = createAsyncThunk(
  "reviews/removeReview",
  async (reviewId: string, { rejectWithValue }) => {
    try {
      await deleteReview(reviewId);
      return reviewId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete review"
      );
    }
  }
);

export const toggleLikeReview = createAsyncThunk(
  "reviews/toggleLikeReview",
  async (reviewId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const review =
        state.reviews.mediaReviews[
          Object.keys(state.reviews.mediaReviews)[0]
        ]?.find((r) => r.id === reviewId) ||
        state.reviews.userReviews.find((r) => r.id === reviewId) ||
        state.reviews.currentReview;

      if (!review) {
        throw new Error("Review not found");
      }

      const response = await likeReview(reviewId, !review.isLiked);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to like review"
      );
    }
  }
);

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearCurrentReview: (state) => {
      state.currentReview = null;
    },
    clearReviews: (state) => {
      state.userReviews = [];
      state.mediaReviews = {};
      state.currentReview = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user reviews
      .addCase(fetchUserReviews.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userReviews = action.payload.data;
        state.pagination = action.payload.meta.pagination;

        // Also update the userReviewsByMedia map for quick lookup
        action.payload.data.forEach((review) => {
          state.userReviewsByMedia[review.mediaId] = review;
        });

        state.error = null;
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch media reviews
      .addCase(fetchMediaReviews.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMediaReviews.fulfilled, (state, action) => {
        state.status = "succeeded";
        const {
          data: reviews,
          mediaId,
          meta: { pagination },
        } = action.payload;
        state.mediaReviews[mediaId] = reviews;
        state.pagination = pagination;

        // Check if any of these reviews are by the current user and update userReviewsByMedia
        reviews.forEach((review) => {
          if (review.user?.id && review.user.id === "user-123") {
            // Replace with actual current user ID check
            state.userReviewsByMedia[review.mediaId] = review;
          }
        });

        state.error = null;
      })
      .addCase(fetchMediaReviews.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch single review
      .addCase(fetchReview.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchReview.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentReview = action.payload.data;

        // Also update the userReviewsByMedia map if it's the current user's review
        if (action.payload.data.user?.id === "user-123") {
          // Replace with actual current user ID check
          state.userReviewsByMedia[action.payload.data.mediaId] =
            action.payload.data;
        }

        state.error = null;
      })
      .addCase(fetchReview.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Submit review
      .addCase(submitReview.pending, (state) => {
        state.status = "loading";
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentReview = action.payload.data;

        // Add to user reviews
        const existingIndex = state.userReviews.findIndex(
          (r) => r.id === action.payload.data.id
        );
        if (existingIndex === -1) {
          state.userReviews.push(action.payload.data);
        } else {
          state.userReviews[existingIndex] = action.payload.data;
        }

        // Update the userReviewsByMedia map
        state.userReviewsByMedia[action.payload.data.mediaId] =
          action.payload.data;

        // Update in media reviews if present
        if (state.mediaReviews[action.payload.data.mediaId]) {
          const mediaReviewIndex = state.mediaReviews[
            action.payload.data.mediaId
          ].findIndex((r) => r.id === action.payload.data.id);
          if (mediaReviewIndex === -1) {
            state.mediaReviews[action.payload.data.mediaId].unshift(
              action.payload.data
            );
          } else {
            state.mediaReviews[action.payload.data.mediaId][mediaReviewIndex] =
              action.payload.data;
          }
        }

        state.error = null;
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Edit review
      .addCase(editReview.pending, (state) => {
        state.status = "loading";
      })
      .addCase(editReview.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentReview = action.payload.data;

        // Update in user reviews
        const userReviewIndex = state.userReviews.findIndex(
          (r) => r.id === action.payload.data.id
        );
        if (userReviewIndex !== -1) {
          state.userReviews[userReviewIndex] = action.payload.data;
        }

        // Update the userReviewsByMedia map
        state.userReviewsByMedia[action.payload.data.mediaId] =
          action.payload.data;

        // Update in media reviews if present
        if (state.mediaReviews[action.payload.data.mediaId]) {
          const mediaReviewIndex = state.mediaReviews[
            action.payload.data.mediaId
          ].findIndex((r) => r.id === action.payload.data.id);
          if (mediaReviewIndex !== -1) {
            state.mediaReviews[action.payload.data.mediaId][mediaReviewIndex] =
              action.payload.data;
          }
        }

        state.error = null;
      })
      .addCase(editReview.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Remove review
      .addCase(removeReview.pending, (state) => {
        state.status = "loading";
      })
      .addCase(removeReview.fulfilled, (state, action) => {
        state.status = "succeeded";

        // Remove from user reviews
        state.userReviews = state.userReviews.filter(
          (r) => r.id !== action.payload
        );

        // Remove from current review if it's the same
        if (state.currentReview && state.currentReview.id === action.payload) {
          state.currentReview = null;
        }

        // Remove from userReviewsByMedia
        Object.keys(state.userReviewsByMedia).forEach((mediaId) => {
          if (state.userReviewsByMedia[mediaId]?.id === action.payload) {
            state.userReviewsByMedia[mediaId] = null;
          }
        });

        // Remove from media reviews if present
        Object.keys(state.mediaReviews).forEach((mediaId) => {
          state.mediaReviews[mediaId] = state.mediaReviews[mediaId].filter(
            (r) => r.id !== action.payload
          );
        });

        state.error = null;
      })
      .addCase(removeReview.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Toggle like review
      .addCase(toggleLikeReview.fulfilled, (state, action) => {
        const { id, likesCount, isLiked } = action.payload.data;

        // Update in user reviews
        const userReviewIndex = state.userReviews.findIndex((r) => r.id === id);
        if (userReviewIndex !== -1) {
          state.userReviews[userReviewIndex] = {
            ...state.userReviews[userReviewIndex],
            likesCount,
            isLiked,
          };
        }

        // Update in current review if it's the same
        if (state.currentReview && state.currentReview.id === id) {
          state.currentReview = {
            ...state.currentReview,
            likesCount,
            isLiked,
          };
        }

        // Update in media reviews if present
        Object.keys(state.mediaReviews).forEach((mediaId) => {
          const mediaReviewIndex = state.mediaReviews[mediaId].findIndex(
            (r) => r.id === id
          );
          if (mediaReviewIndex !== -1) {
            state.mediaReviews[mediaId][mediaReviewIndex] = {
              ...state.mediaReviews[mediaId][mediaReviewIndex],
              likesCount,
              isLiked,
            };
          }
        });
      });
  },
});

export const { clearCurrentReview, clearReviews } = reviewsSlice.actions;

// Selectors
export const selectUserReviews = (state: RootState) =>
  state.reviews.userReviews;
export const selectMediaReviews = (mediaId: string) => (state: RootState) =>
  state.reviews.mediaReviews[mediaId] || [];
export const selectCurrentReview = (state: RootState) =>
  state.reviews.currentReview;
export const selectUserReviewForMedia =
  (mediaId: string) => (state: RootState) =>
    state.reviews.userReviewsByMedia[mediaId] || null;
export const selectReviewsStatus = (state: RootState) => state.reviews.status;
export const selectReviewsError = (state: RootState) => state.reviews.error;
export const selectReviewsPagination = (state: RootState) =>
  state.reviews.pagination;

export default reviewsSlice.reducer;
