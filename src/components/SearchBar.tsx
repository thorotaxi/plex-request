import React, { useState, useEffect, useRef } from 'react';
import { SearchResult } from '../types';
import { tmdbApi } from '../services/tmdbApi';
import ImageWithFallback from './ImageWithFallback';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClearSearch: () => void;
  isLoading?: boolean;
}

/**
 * Search bar component with autocomplete dropdown
 */
const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onClearSearch, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced autocomplete search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length >= 3) {
      setIsLoadingSuggestions(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await tmdbApi.searchMulti(query.trim());
          setSuggestions(results.slice(0, 5)); // Only show top 5 results
          setShowSuggestions(true);
        } catch (error) {
          console.error('Autocomplete search failed:', error);
          setSuggestions([]);
        } finally {
          setIsLoadingSuggestions(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchResult) => {
    setQuery(suggestion.title || suggestion.name || '');
    onSearch(suggestion.title || suggestion.name || '');
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleClearInput = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };



  const getTitle = (result: SearchResult): string => {
    return result.title || result.name || 'Unknown Title';
  };

  const getReleaseYear = (result: SearchResult): string => {
    const date = result.release_date || result.first_air_date;
    return date ? new Date(date).getFullYear().toString() : 'N/A';
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 relative" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => query.trim().length >= 3 && setShowSuggestions(true)}
            placeholder="Search for movies or TV shows..."
            className="w-full px-4 py-3 pl-12 pr-24 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          {/* Clear input button - positioned inside the field, to the left of search button */}
          {query.trim() && (
            <button
              type="button"
              onClick={handleClearInput}
              className="absolute inset-y-0 right-20 flex items-center px-2 text-sm font-medium text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              <svg
                className="w-4 h-4"
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
            </button>
          )}
          
          {/* Search button - always positioned on the right */}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute inset-y-0 right-0 flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
          >
            {isLoading ? (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            {isLoadingSuggestions ? (
              <div className="p-4 text-center text-gray-500">
                <svg className="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </div>
            ) : suggestions.length > 0 ? (
              <div className="py-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={`${suggestion.media_type}-${suggestion.id}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-16 flex items-center justify-center rounded ${
                        suggestion.media_type === 'movie' ? 'bg-red-50' : 'bg-indigo-50'
                      }`}>
                        <ImageWithFallback
                          src={tmdbApi.getPosterUrl(suggestion.poster_path)}
                          alt={getTitle(suggestion)}
                          className="w-full h-full object-contain rounded"
                          fallbackSrc="/placeholder-poster.svg"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {getTitle(suggestion)}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          suggestion.media_type === 'movie' 
                                            ? 'bg-red-100 text-red-800'
                : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {suggestion.media_type === 'movie' ? 'Movie' : 'TV Show'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {getReleaseYear(suggestion)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No results found
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
