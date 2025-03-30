export type MediaType = "MOVIE" | "GAME" | "MANGA" | null;
export type SortOption =
  | "popularity"
  | "releaseDate"
  | "averageRating"
  | "title";
export type SortOrder = "asc" | "desc";

export interface MediaFilters {
  page: number;
  limit: number;
  type: MediaType;
  genre: string | null;
  search: string;
  sortBy: SortOption;
  sortOrder: SortOrder;
}

export interface MediaItem {
  id: string;
  title: string;
  originalTitle?: string;
  mediaType: MediaType;
  description: string;
  coverImage: string;
  releaseDate: string;
  averageRating: number;
  genres: Array<{
    genreId: string;
    genre: {
      id: string;
      name: string;
    };
  }>;
  popularity: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
