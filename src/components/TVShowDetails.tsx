import React, { useState, useEffect, useCallback } from 'react';
import { SearchResult, TVSeason, TVEpisode, TMDbTVShowResponse, TMDbSeasonResponse } from '../types';
import { tmdbApi } from '../services/tmdbApi';
import ImageWithFallback from './ImageWithFallback';

interface TVShowDetailsProps {
  show: SearchResult;
  onRequest: (request: {
    type: 'tv' | 'season' | 'episode';
    showId: number;
    showTitle: string;
    seasonNumber?: number;
    episodeNumber?: number;
    episodeTitle?: string;
    posterPath: string | null;
  }) => void;
  onGoToRequest: (request: {
    type: 'tv' | 'season' | 'episode';
    showId: number;
    showTitle: string;
    seasonNumber?: number;
    episodeNumber?: number;
    episodeTitle?: string;
    posterPath: string | null;
  }) => void;
  hasExistingRequest: (tmdbId: number, type: 'movie' | 'tv' | 'season' | 'episode', requestDetails?: any) => boolean;
  onClose: () => void;
}

/**
 * Component for displaying TV show details with season and episode selection
 */
const TVShowDetails: React.FC<TVShowDetailsProps> = ({ show, onRequest, onGoToRequest, hasExistingRequest, onClose }) => {
  const [showDetails, setShowDetails] = useState<TMDbTVShowResponse | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<TVSeason | null>(null);
  const [seasonDetails, setSeasonDetails] = useState<TMDbSeasonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShowDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const details = await tmdbApi.getTVShowDetails(show.id);
      setShowDetails(details);
    } catch (err) {
      setError('Failed to load show details');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [show.id]);

  useEffect(() => {
    loadShowDetails();
  }, [loadShowDetails]);

  const loadSeasonDetails = async (season: TVSeason) => {
    setSelectedSeason(season);
    setIsLoading(true);
    try {
      const details = await tmdbApi.getSeasonDetails(show.id, season.season_number);
      setSeasonDetails(details);
    } catch (err) {
      setError('Failed to load season details');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestShow = () => {
    const requestDetails: {
      type: 'tv';
      showId: number;
      showTitle: string;
      posterPath: string | null;
    } = {
      type: 'tv',
      showId: show.id,
      showTitle: show.name || show.title || 'Unknown Show',
      posterPath: show.poster_path
    };

    if (hasExistingRequest(show.id, 'tv', null)) {
      onGoToRequest(requestDetails);
    } else {
      onRequest(requestDetails);
    }
  };

  const handleRequestSeason = (season: TVSeason) => {
    const requestDetails: {
      type: 'season';
      showId: number;
      showTitle: string;
      seasonNumber: number;
      posterPath: string | null;
    } = {
      type: 'season',
      showId: show.id,
      showTitle: show.name || show.title || 'Unknown Show',
      seasonNumber: season.season_number,
      posterPath: season.poster_path || show.poster_path
    };

    if (hasExistingRequest(show.id, 'season', { showId: show.id, seasonNumber: season.season_number })) {
      onGoToRequest(requestDetails);
    } else {
      onRequest(requestDetails);
    }
  };

  const handleRequestEpisode = (episode: TVEpisode) => {
    const requestDetails: {
      type: 'episode';
      showId: number;
      showTitle: string;
      seasonNumber: number;
      episodeNumber: number;
      episodeTitle: string;
      posterPath: string | null;
    } = {
      type: 'episode',
      showId: show.id,
      showTitle: show.name || show.title || 'Unknown Show',
      seasonNumber: episode.season_number,
      episodeNumber: episode.episode_number,
      episodeTitle: episode.name,
      posterPath: episode.still_path || show.poster_path
    };

    if (hasExistingRequest(show.id, 'episode', { 
      showId: show.id, 
      seasonNumber: episode.season_number, 
      episodeNumber: episode.episode_number 
    })) {
      onGoToRequest(requestDetails);
    } else {
      onRequest(requestDetails);
    }
  };

  if (isLoading && !showDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-red-600 text-lg mb-4">{error}</div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {show.name || show.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Show Info */}
          <div className="flex items-start space-x-6 mb-8">
            <div className="w-32 h-48 flex items-center justify-center bg-indigo-50 rounded-lg">
              <ImageWithFallback
                src={tmdbApi.getPosterUrl(show.poster_path)}
                alt={show.name || show.title || 'Unknown Show'}
                className="w-full h-full object-contain rounded-lg"
                fallbackSrc="/placeholder-poster.svg"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{show.name || show.title}</h3>
              {showDetails && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Seasons: {showDetails.number_of_seasons}</p>
                  <p>First Aired: {new Date(showDetails.first_air_date).getFullYear()}</p>
                </div>
              )}
              {show.overview && (
                <p className="text-gray-700 mt-3">{show.overview}</p>
              )}
              <button
                onClick={handleRequestShow}
                className={`mt-4 px-4 py-2 rounded-md transition-colors ${
                  hasExistingRequest(show.id, 'tv', null)
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {hasExistingRequest(show.id, 'tv', null) ? 'Go To Request' : 'Request Entire Show'}
              </button>
            </div>
          </div>

          {/* Seasons */}
          {showDetails && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Seasons</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {showDetails.seasons.map((season: TVSeason) => (
                  <div
                    key={season.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedSeason?.id === season.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => loadSeasonDetails(season)}
                  >
                                         <div className="flex items-start space-x-3">
                       <div className="w-16 h-24 flex items-center justify-center bg-indigo-50 rounded">
                         <ImageWithFallback
                           src={tmdbApi.getPosterUrl(season.poster_path)}
                           alt={season.name}
                           className="w-full h-full object-contain rounded"
                           fallbackSrc="/placeholder-poster.svg"
                         />
                       </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{season.name}</h4>
                        <p className="text-sm text-gray-600">
                          {season.episode_count} episodes
                        </p>
                        {season.air_date && (
                          <p className="text-sm text-gray-600">
                            {new Date(season.air_date).getFullYear()}
                          </p>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRequestSeason(season);
                          }}
                          className={`mt-2 px-3 py-1 rounded text-sm transition-colors ${
                            hasExistingRequest(show.id, 'season', { showId: show.id, seasonNumber: season.season_number })
                              ? 'bg-orange-600 text-white hover:bg-orange-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {hasExistingRequest(show.id, 'season', { showId: show.id, seasonNumber: season.season_number }) 
                            ? 'Go To Request' 
                            : 'Request Season'
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Episodes */}
          {selectedSeason && seasonDetails && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Episodes - {selectedSeason.name}
              </h3>
              <div className="space-y-3">
                {seasonDetails.episodes.map((episode: TVEpisode) => (
                                     <div
                     key={episode.id}
                     className="flex items-start space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                   >
                     <div className="w-20 h-12 flex items-center justify-center bg-indigo-50 rounded">
                       <ImageWithFallback
                         src={tmdbApi.getPosterUrl(episode.still_path)}
                         alt={episode.name}
                         className="w-full h-full object-contain rounded"
                         fallbackSrc="/placeholder-poster.svg"
                       />
                     </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          {episode.episode_number}. {episode.name}
                        </h4>
                        <button
                          onClick={() => handleRequestEpisode(episode)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            hasExistingRequest(show.id, 'episode', { 
                              showId: show.id, 
                              seasonNumber: episode.season_number, 
                              episodeNumber: episode.episode_number 
                            })
                              ? 'bg-orange-600 text-white hover:bg-orange-700'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {hasExistingRequest(show.id, 'episode', { 
                            showId: show.id, 
                            seasonNumber: episode.season_number, 
                            episodeNumber: episode.episode_number 
                          }) 
                            ? 'Go To Request' 
                            : 'Request Episode'
                          }
                        </button>
                      </div>
                      {episode.air_date && (
                        <p className="text-sm text-gray-600">
                          Aired: {new Date(episode.air_date).toLocaleDateString()}
                        </p>
                      )}
                      {episode.overview && (
                        <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                          {episode.overview}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TVShowDetails;
