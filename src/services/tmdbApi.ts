import { SearchResult, TMDbSearchResponse, TMDbTVShowResponse, TMDbSeasonResponse } from '../types';
import { getApiBaseUrl } from '../config/api';

/**
 * TMDb API service for searching movies and TV shows
 * Note: You'll need to get a TMDb API key from https://www.themoviedb.org/settings/api
 */
class TMDbApiService {
  private readonly baseUrl = getApiBaseUrl().replace('/api', '');
  private readonly apiKey = process.env.REACT_APP_TMDB_API_KEY;

  /**
   * Search for movies and TV shows
   * @param query - Search query
   * @param page - Page number (default: 1)
   * @returns Promise with search results
   */
  async searchMulti(query: string, page: number = 1): Promise<SearchResult[]> {
    console.log('🔍 Searching via backend proxy...');
    
    try {
      const url = `${this.baseUrl}/api/tmdb/search?query=${encodeURIComponent(query)}&page=${page}`;
      console.log('Making request to:', url);
      
      const response = await fetch(url, {
        headers: {
          'bypass-tunnel-reminder': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TMDbSearchResponse = await response.json();
      console.log('TMDb response:', data);
      
      return data.results || [];
    } catch (error) {
      console.error('Error searching TMDb:', error);
      return this.getMockSearchResults(query);
    }
  }

  /**
   * Get poster URL for a given poster path
   * @param posterPath - Poster path from TMDb
   * @param size - Image size (default: 'w500')
   * @returns Full poster URL
   */
  getPosterUrl(posterPath: string | null, size: string = 'w500', cacheBuster?: string): string | null {
    if (!posterPath) return null;
    // Add cache-busting parameter if provided to prevent stale images
    const url = `https://image.tmdb.org/t/p/${size}${posterPath}`;
    return cacheBuster ? `${url}?cb=${cacheBuster}` : url;
  }

  /**
   * Get TV show details including seasons
   * @param showId - TMDb show ID
   * @returns Promise with TV show details
   */
  async getTVShowDetails(showId: number): Promise<TMDbTVShowResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/tmdb/tv/${showId}`,
        {
          headers: {
            'bypass-tunnel-reminder': 'true'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching TV show details:', error);
      throw error;
    }
  }

  /**
   * Get season details including episodes
   * @param showId - TMDb show ID
   * @param seasonNumber - Season number
   * @returns Promise with season details
   */
  async getSeasonDetails(showId: number, seasonNumber: number): Promise<TMDbSeasonResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/tmdb/tv/${showId}/season/${seasonNumber}`,
        {
          headers: {
            'bypass-tunnel-reminder': 'true'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching season details:', error);
      throw error;
    }
  }

  /**
   * Mock search results for development/testing
   * @param query - Search query
   * @returns Mock search results
   */
  private getMockSearchResults(query: string): SearchResult[] {
    const mockResults: SearchResult[] = [
      {
        id: 1,
        title: 'The Shawshank Redemption',
        release_date: '1994-09-22',
        poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
        media_type: 'movie',
        genre_ids: [18, 80],
        overview: 'Two imprisoned men bond over a number of years...'
      },
      {
        id: 2,
        title: 'Breaking Bad',
        name: 'Breaking Bad',
        first_air_date: '2008-01-20',
        poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
        media_type: 'tv',
        genre_ids: [18, 80],
        overview: 'A high school chemistry teacher turned methamphetamine manufacturer...'
      },
      {
        id: 3,
        title: 'The Dark Knight',
        release_date: '2008-07-18',
        poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        media_type: 'movie',
        genre_ids: [28, 18, 80],
        overview: 'When the menace known as the Joker wreaks havoc and chaos...'
      }
    ];

    // Filter mock results based on query
    return mockResults.filter(result => 
      (result.title && result.title.toLowerCase().includes(query.toLowerCase())) ||
      (result.name && result.name.toLowerCase().includes(query.toLowerCase()))
    );
  }
}

export const tmdbApi = new TMDbApiService();
