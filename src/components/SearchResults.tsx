import React, { useState, useMemo } from 'react';
import { SearchResult } from '../types';
import { tmdbApi } from '../services/tmdbApi';
import ImageWithFallback from './ImageWithFallback';

interface SearchResultsProps {
  results: SearchResult[];
  onRequest: (result: SearchResult) => void;
  onShowDetails?: (result: SearchResult) => void;
  onGoToRequest?: (result: SearchResult) => void;
  onClearResults?: () => void;
  isLoading?: boolean;
  searchQuery?: string; // Add search query for cache busting
  existingRequests?: Map<string, boolean>; // Map of result keys to whether they have existing requests
}

/**
 * Component to display search results with posters and request functionality
 */
const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  onRequest, 
  onShowDetails,
  onGoToRequest,
  onClearResults,
  isLoading = false,
  searchQuery,
  existingRequests
}) => {
  // Filter state - must be at the top before any conditional returns
  const [mediaFilter, setMediaFilter] = useState<'all' | 'movie' | 'tv'>('all');

  // Filter and limit results - must be at the top before any conditional returns
  const maxResults = 12;
  const filteredResults = useMemo(() => {
    if (mediaFilter === 'all') return results;
    return results.filter(result => result.media_type === mediaFilter);
  }, [results, mediaFilter]);
  
  const displayResults = filteredResults.slice(0, maxResults);
  const totalResults = results.length;
  const filteredTotal = filteredResults.length;
  const isLimited = filteredTotal > maxResults;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Searching...</p>
        <p className="text-gray-400 text-sm mt-1">Finding movies and TV shows for you</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">
          {isLoading ? 'Searching...' : 'No results found'}
        </div>
        <div className="text-gray-400 text-sm">
          {isLoading 
            ? 'Finding movies and TV shows for you...' 
            : 'Try searching for popular titles like "Breaking Bad", "The Dark Knight", or "Game of Thrones"'
          }
        </div>
      </div>
    );
  }

  const getReleaseYear = (result: SearchResult): string => {
    const date = result.release_date || result.first_air_date;
    return date ? new Date(date).getFullYear().toString() : 'N/A';
  };

  const getTitle = (result: SearchResult): string => {
    return result.title || result.name || 'Unknown Title';
  };

  const getResultsText = () => {
    if (mediaFilter !== 'all') {
      const filterLabel = mediaFilter === 'movie' ? 'Movies' : 'TV Shows';
      if (isLimited) {
        return `Showing the first ${maxResults} ${filterLabel.toLowerCase()}. You may need to refine your search.`;
      }
      return `Found ${filteredTotal} ${filterLabel.toLowerCase()}${filteredTotal !== 1 ? '' : ''}`;
    }
    if (isLimited) {
      return `Showing the first ${maxResults} results. You may need to refine your search.`;
    }
    return `Found ${totalResults} result${totalResults !== 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Results count, filter, and clear button */}
      <div className="flex items-center justify-between">
        <div className="flex-1 text-center">
          <p className="text-sm text-gray-600">
            {getResultsText()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Filter dropdown */}
          <div className="relative">
            <select
              value={mediaFilter}
              onChange={(e) => setMediaFilter(e.target.value as 'all' | 'movie' | 'tv')}
              className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Media</option>
              <option value="movie">Movies Only</option>
              <option value="tv">TV Shows Only</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Clear Results button */}
          {onClearResults && (
            <button
              type="button"
              onClick={onClearResults}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear Results
            </button>
          )}
        </div>
      </div>
      
      {/* Results grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayResults.map((result, index) => (
          <div
            key={`${result.media_type}-${result.id}-${index}`}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col"
          >
            <div className={`h-64 flex items-center justify-center ${
              result.media_type === 'movie' ? 'bg-red-50' : 'bg-indigo-50'
            }`}>
              <ImageWithFallback
                src={tmdbApi.getPosterUrl(result.poster_path, 'w500', searchQuery ? `search-${searchQuery.replace(/\s+/g, '-')}-${index}` : undefined)}
                alt={getTitle(result)}
                className="w-full h-full object-contain"
                fallbackSrc="/placeholder-poster.svg"
              />
            </div>
            
            <div className="p-4 flex flex-col flex-1">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                  {getTitle(result)}
                </h3>
                <div className="flex items-center space-x-2 mb-3">
                  <p className="text-sm text-gray-600">
                    {getReleaseYear(result)}
                  </p>
                  <span className="text-gray-500">•</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    result.media_type === 'movie' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {result.media_type === 'movie' ? 'Movie' : 'TV Show'}
                  </span>
                </div>
                
                {result.overview && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {result.overview}
                  </p>
                )}
              </div>
              
              <div className="flex space-x-2 pt-4">
                {existingRequests?.get(`${result.media_type}-${result.id}`) ? (
                  <button
                    onClick={() => onGoToRequest?.(result)}
                    className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
                  >
                    Go To Request
                  </button>
                ) : (
                  <button
                    onClick={() => onRequest?.(result)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
                  >
                    Request
                  </button>
                )}
                {result.media_type === 'tv' && onShowDetails && (
                  <button
                    onClick={() => onShowDetails(result)}
                    className="bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    title="View Seasons & Episodes"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
