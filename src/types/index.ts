/**
 * Type definitions for the Family Media Request Tool
 */

// TMDb API Response Types
export interface TMDbSearchResponse {
  page: number;
  results: SearchResult[];
  total_pages: number;
  total_results: number;
}

export interface TMDbTVShowResponse {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string;
  seasons: TVSeason[];
  number_of_seasons: number;
  number_of_episodes: number;
}

export interface TMDbSeasonResponse {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  air_date: string;
  season_number: number;
  episodes: TVEpisode[];
}

// Search Result Types
export interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  genre_ids: number[];
  overview: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
}

// TV Show Types
export interface TVSeason {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  air_date: string;
  season_number: number;
  episode_count: number;
}

export interface TVEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  episode_number: number;
  season_number: number;
  vote_average: number;
  vote_count: number;
}

// Media Request Types
export interface MediaRequest {
  id: string;
  tmdbId: number;
  title: string;
  type: 'movie' | 'tv' | 'season' | 'episode';
  status: 'new' | 'pending' | 'complete';
  requesterName: string;
  posterPath: string | null;
  requestDate: Date;
  completedDate?: Date;
  comment?: string;
  adminComment?: string;
  // TV show specific fields
  showId?: number;
  showTitle?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
}

// Component Props Types
export interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (requesterName: string, comment?: string) => void;
  selectedItem: SearchResult | null;
  requestType: 'movie' | 'tv' | 'season' | 'episode';
  requestDetails?: {
    showId?: number;
    showTitle?: string;
    seasonNumber?: number;
    episodeNumber?: number;
    episodeTitle?: string;
  };
}

export interface AdminAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (authenticated: boolean) => void;
}

export interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: MediaRequest | null;
  onAddComment: (requestId: string, comment: string, isAdmin: boolean) => void;
  isAdmin: boolean;
}
