import axios from "axios";
import type {
  MediaFilters,
  MediaItem,
  PaginationMeta,
} from "@/lib/features/media/mediaSlice";

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.example.com",
  headers: {
    "Content-Type": "application/json",
  },
});

interface MediaResponse {
  data: MediaItem[];
  meta: {
    pagination: PaginationMeta;
  };
}

export const fetchMedia = async (
  filters: MediaFilters
): Promise<MediaResponse> => {
  try {
    const response = await api.get("/media", { params: filters });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch media");
    }
    throw error;
  }
};
export const fetchMediaDetails = async (id: string): Promise<MediaItem> => {
  try {
    const response = await api.get(`/media/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch media details"
      );
    }
    throw error;
  }
};
