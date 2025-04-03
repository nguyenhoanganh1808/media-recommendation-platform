import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createRating,
  updateRating,
  deleteRating,
  getUserRatings,
  getMediaRatings,
  getRating,
} from "@/lib/services/ratings";
import type { RootState } from "@/lib/store";

export interface Rating {
  id: string;
  userId: string;
  mediaId: string;
  rating: number;
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

interface RatingsState {
  userRatings: Rating[];
  mediaRatings: Record<string, Rating[]>;
  currentRating: Rating | null;
  userRatingsByMedia: Record<string, Rating | null>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

const initialState: RatingsState = {
  userRatings: [],
  mediaRatings: {},
  currentRating: null,
  userRatingsByMedia: {},
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
export const fetchUserRatings = createAsyncThunk(
  "ratings/fetchUserRatings",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await getUserRatings(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch user ratings"
      );
    }
  }
);

export const fetchMediaRatings = createAsyncThunk(
  "ratings/fetchMediaRatings",
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
      const response = await getMediaRatings(mediaId, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch media ratings"
      );
    }
  }
);

export const fetchRating = createAsyncThunk(
  "ratings/fetchRating",
  async (ratingId: string, { rejectWithValue }) => {
    try {
      const response = await getRating(ratingId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch rating"
      );
    }
  }
);

export const submitRating = createAsyncThunk(
  "ratings/submitRating",
  async (
    {
      mediaId,
      rating,
    }: {
      mediaId: string;
      rating: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await createRating(mediaId, rating);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to submit rating"
      );
    }
  }
);

export const editRating = createAsyncThunk(
  "ratings/editRating",
  async (
    {
      ratingId,
      rating,
    }: {
      ratingId: string;
      rating: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateRating(ratingId, rating);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update rating"
      );
    }
  }
);

export const removeRating = createAsyncThunk(
  "ratings/removeRating",
  async (ratingId: string, { rejectWithValue }) => {
    try {
      await deleteRating(ratingId);
      return ratingId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete rating"
      );
    }
  }
);

const ratingsSlice = createSlice({
  name: "ratings",
  initialState,
  reducers: {
    clearCurrentRating: (state) => {
      state.currentRating = null;
    },
    clearRatings: (state) => {
      state.userRatings = [];
      state.mediaRatings = {};
      state.currentRating = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user ratings
      .addCase(fetchUserRatings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserRatings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userRatings = action.payload.data;
        state.pagination = action.payload.meta.pagination;

        // Also update the userRatingsByMedia map for quick lookup
        action.payload.data.forEach((rating) => {
          state.userRatingsByMedia[rating.mediaId] = rating;
        });

        state.error = null;
      })
      .addCase(fetchUserRatings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch media ratings
      .addCase(fetchMediaRatings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMediaRatings.fulfilled, (state, action) => {
        state.status = "succeeded";
        const ratings = action.payload.data;
        const pagination = action.payload.meta.pagination;
        const mediaId = action.meta.arg.mediaId;
        state.mediaRatings[mediaId] = ratings;
        state.pagination = pagination;
        state.error = null;
      })
      .addCase(fetchMediaRatings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch single rating
      .addCase(fetchRating.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRating.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentRating = action.payload.data;

        // Also update the userRatingsByMedia map
        if (action.payload.data.mediaId) {
          state.userRatingsByMedia[action.payload.data.mediaId] =
            action.payload.data;
        }

        state.error = null;
      })
      .addCase(fetchRating.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Submit rating
      .addCase(submitRating.pending, (state) => {
        state.status = "loading";
      })
      .addCase(submitRating.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentRating = action.payload.data;

        // Add to user ratings if not already there
        const existingIndex = state.userRatings.findIndex(
          (r) => r.id === action.payload.data.id
        );
        if (existingIndex === -1) {
          state.userRatings.push(action.payload.data);
        } else {
          state.userRatings[existingIndex] = action.payload.data;
        }

        // Update the userRatingsByMedia map
        state.userRatingsByMedia[action.payload.data.mediaId] =
          action.payload.data;

        // Update in media ratings if present
        if (state.mediaRatings[action.payload.data.mediaId]) {
          const mediaRatingIndex = state.mediaRatings[
            action.payload.data.mediaId
          ].findIndex((r) => r.id === action.payload.data.id);
          if (mediaRatingIndex === -1) {
            state.mediaRatings[action.payload.data.mediaId].push(
              action.payload.data
            );
          } else {
            state.mediaRatings[action.payload.data.mediaId][mediaRatingIndex] =
              action.payload.data;
          }
        }

        state.error = null;
      })
      .addCase(submitRating.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Edit rating
      .addCase(editRating.pending, (state) => {
        state.status = "loading";
      })
      .addCase(editRating.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentRating = action.payload.data;

        // Update in user ratings
        const userRatingIndex = state.userRatings.findIndex(
          (r) => r.id === action.payload.data.id
        );
        if (userRatingIndex !== -1) {
          state.userRatings[userRatingIndex] = action.payload.data;
        }

        // Update the userRatingsByMedia map
        state.userRatingsByMedia[action.payload.data.mediaId] =
          action.payload.data;

        // Update in media ratings if present
        if (state.mediaRatings[action.payload.data.mediaId]) {
          const mediaRatingIndex = state.mediaRatings[
            action.payload.data.mediaId
          ].findIndex((r) => r.id === action.payload.data.id);
          if (mediaRatingIndex !== -1) {
            state.mediaRatings[action.payload.data.mediaId][mediaRatingIndex] =
              action.payload.data;
          }
        }

        state.error = null;
      })
      .addCase(editRating.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Remove rating
      .addCase(removeRating.pending, (state) => {
        state.status = "loading";
      })
      .addCase(removeRating.fulfilled, (state, action) => {
        state.status = "succeeded";

        // Remove from user ratings
        state.userRatings = state.userRatings.filter(
          (r) => r.id !== action.payload
        );

        // Remove from current rating if it's the same
        if (state.currentRating && state.currentRating.id === action.payload) {
          state.currentRating = null;
        }

        // Remove from userRatingsByMedia
        Object.keys(state.userRatingsByMedia).forEach((mediaId) => {
          if (state.userRatingsByMedia[mediaId]?.id === action.payload) {
            state.userRatingsByMedia[mediaId] = null;
          }
        });

        // Remove from media ratings if present
        Object.keys(state.mediaRatings).forEach((mediaId) => {
          state.mediaRatings[mediaId] = state.mediaRatings[mediaId].filter(
            (r) => r.id !== action.payload
          );
        });

        state.error = null;
      })
      .addCase(removeRating.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentRating, clearRatings } = ratingsSlice.actions;

// Selectors
export const selectUserRatings = (state: RootState) =>
  state.ratings.userRatings;
export const selectMediaRatings = (mediaId: string) => (state: RootState) =>
  state.ratings.mediaRatings[mediaId] || [];
export const selectCurrentRating = (state: RootState) =>
  state.ratings.currentRating;
export const selectUserRatingForMedia =
  (mediaId: string) => (state: RootState) =>
    state.ratings.userRatingsByMedia[mediaId] || null;
export const selectRatingsStatus = (state: RootState) => state.ratings.status;
export const selectRatingsError = (state: RootState) => state.ratings.error;
export const selectRatingsPagination = (state: RootState) =>
  state.ratings.pagination;

export default ratingsSlice.reducer;
