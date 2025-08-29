import React, { useState, useEffect } from 'react';
import { SearchResult, MediaRequest } from './types';
import { tmdbApi } from './services/tmdbApi';
import { apiService } from './services/apiService';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import RequestList from './components/RequestList';
import RequestModal from './components/RequestModal';
import TVShowDetails from './components/TVShowDetails';
import AdminAuth from './components/AdminAuth';
import CommentModal from './components/CommentModal';
import ExistingRequestModal from './components/ExistingRequestModal';
import AdminPanel from './components/AdminPanel';

/**
 * Main application component for the Family Media Request Tool
 */
const App: React.FC = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [requests, setRequests] = useState<MediaRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [showTVDetails, setShowTVDetails] = useState<SearchResult | null>(null);
  const [requestType, setRequestType] = useState<'movie' | 'tv' | 'season' | 'episode'>('movie');
  const [requestDetails, setRequestDetails] = useState<{
    showId?: number;
    showTitle?: string;
    seasonNumber?: number;
    episodeNumber?: number;
    episodeTitle?: string;
  } | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedRequestForComment, setSelectedRequestForComment] = useState<MediaRequest | null>(null);
  const [showExistingRequest, setShowExistingRequest] = useState<MediaRequest | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Load data from API on component mount
  useEffect(() => {
    const loadRequests = async () => {
      try {
        const requests = await apiService.getRequests();
        setRequests(requests);
      } catch (error) {
        console.error('Failed to load requests:', error);
        // Fallback to empty array if API is not available
        setRequests([]);
      }
    };
    
    loadRequests();
  }, []);

  /**
   * Handle search functionality
   * @param query - Search query string
   */
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentSearchQuery('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setCurrentSearchQuery(query.trim());
    try {
      const results = await tmdbApi.searchMulti(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle request button click from search results
   * @param result - Selected search result
   */
  const handleRequestClick = (result: SearchResult) => {
    setSelectedItem(result);
    setRequestType(result.media_type);
    setRequestDetails(null);
    setIsModalOpen(true);
  };

  /**
   * Handle "Go To Request" button click from search results
   * @param result - Selected search result
   */
  const handleGoToRequest = (result: SearchResult) => {
    const existingRequest = findExistingRequest(result.id, result.media_type, null);
    if (existingRequest) {
      setShowExistingRequest(existingRequest);
    }
  };

  /**
   * Check if a request already exists for a specific item
   * @param tmdbId - TMDb ID
   * @param type - Request type
   * @param requestDetails - Additional details for seasons/episodes
   * @returns true if a new/pending request exists
   */
  const hasExistingRequest = (
    tmdbId: number,
    type: 'movie' | 'tv' | 'season' | 'episode',
    requestDetails?: {
      showId?: number;
      showTitle?: string;
      seasonNumber?: number;
      episodeNumber?: number;
      episodeTitle?: string;
    } | null
  ): boolean => {
    const existingRequest = findExistingRequest(tmdbId, type, requestDetails);
    return !!(existingRequest && (existingRequest.status === 'new' || existingRequest.status === 'pending'));
  };

  /**
   * Handle TV show details button click
   * @param result - Selected TV show
   */
  const handleShowTVDetails = (result: SearchResult) => {
    setShowTVDetails(result);
  };

  /**
   * Handle request from TV show details
   * @param request - Request details from TV show
   */
  const handleTVRequest = (request: {
    type: 'tv' | 'season' | 'episode';
    showId: number;
    showTitle: string;
    seasonNumber?: number;
    episodeNumber?: number;
    episodeTitle?: string;
    posterPath: string | null;
  }) => {
    setSelectedItem(showTVDetails);
    setRequestType(request.type);
    setRequestDetails({
      showId: request.showId,
      showTitle: request.showTitle,
      seasonNumber: request.seasonNumber,
      episodeNumber: request.episodeNumber,
      episodeTitle: request.episodeTitle
    });
    setShowTVDetails(null);
    setIsModalOpen(true);
  };

  /**
   * Handle "Go To Request" from TV show details
   * @param request - Request details from TV show
   */
  const handleTVGoToRequest = (request: {
    type: 'tv' | 'season' | 'episode';
    showId: number;
    showTitle: string;
    seasonNumber?: number;
    episodeNumber?: number;
    episodeTitle?: string;
    posterPath: string | null;
  }) => {
    const existingRequest = findExistingRequest(request.showId, request.type, {
      showId: request.showId,
      seasonNumber: request.seasonNumber,
      episodeNumber: request.episodeNumber
    });
    if (existingRequest) {
      setShowExistingRequest(existingRequest);
    }
  };

  /**
   * Check if a duplicate request exists
   * @param tmdbId - TMDb ID of the item
   * @param type - Type of request
   * @param requestDetails - Additional details for TV shows
   * @returns Existing request if found, null otherwise
   */
  const findExistingRequest = (
    tmdbId: number, 
    type: 'movie' | 'tv' | 'season' | 'episode',
    requestDetails: {
      showId?: number;
      showTitle?: string;
      seasonNumber?: number;
      episodeNumber?: number;
      episodeTitle?: string;
    } | null | undefined
  ): MediaRequest | null => {
    return requests.find(request => {
      // Check if it's the same TMDb item
      if (request.tmdbId !== tmdbId) return false;
      
      // For movies and TV shows, exact match
      if (type === 'movie' || type === 'tv') {
        return request.type === type;
      }
      
      // For seasons, check show ID and season number
      if (type === 'season') {
        return request.type === 'season' && 
               request.showId === requestDetails?.showId && 
               request.seasonNumber === requestDetails?.seasonNumber;
      }
      
      // For episodes, check show ID, season number, and episode number
      if (type === 'episode') {
        return request.type === 'episode' && 
               request.showId === requestDetails?.showId && 
               request.seasonNumber === requestDetails?.seasonNumber &&
               request.episodeNumber === requestDetails?.episodeNumber;
      }
      
      return false;
    }) || null;
  };

  /**
   * Handle adding a new request
   * @param requesterName - Name of the person making the request
   * @param comment - Optional comment for the request
   */
  const handleAddRequest = async (requesterName: string, comment?: string) => {
    if (!selectedItem) return;

    let title = selectedItem.title || selectedItem.name || 'Unknown Title';
    
    // Add season/episode info to title if applicable
    if (requestType === 'season' && requestDetails?.seasonNumber) {
      title += ` - Season ${requestDetails.seasonNumber}`;
    } else if (requestType === 'episode' && requestDetails?.episodeNumber && requestDetails?.episodeTitle) {
      title += ` - S${requestDetails.seasonNumber}E${requestDetails.episodeNumber}: ${requestDetails.episodeTitle}`;
    }

    // Check for existing request
    const existingRequest = findExistingRequest(selectedItem.id, requestType, requestDetails);
    
    if (existingRequest && (existingRequest.status === 'new' || existingRequest.status === 'pending')) {
      // Show existing request instead of creating duplicate
      setShowExistingRequest(existingRequest);
      setSelectedItem(null);
      setRequestDetails(null);
      setIsModalOpen(false);
      return;
    }

    try {
      await apiService.createRequest({
        tmdbId: selectedItem.id,
        title,
        type: requestType,
        status: 'new',
        requesterName,
        posterPath: selectedItem.poster_path,
        comment,
        // TV show specific fields
        showId: requestDetails?.showId,
        showTitle: requestDetails?.showTitle,
        seasonNumber: requestDetails?.seasonNumber,
        episodeNumber: requestDetails?.episodeNumber,
        episodeTitle: requestDetails?.episodeTitle
      });

      // Reload requests from API
      const updatedRequests = await apiService.getRequests();
      setRequests(updatedRequests);
      
      setSelectedItem(null);
      setRequestDetails(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create request:', error);
      alert('Failed to create request. Please try again.');
    }
  };

  /**
   * Handle marking a request as complete
   * @param requestId - ID of the request to mark complete
   */
  const handleMarkComplete = async (requestId: string) => {
    try {
      await apiService.updateRequestStatus(requestId, 'complete');
      // Reload requests from API
      const updatedRequests = await apiService.getRequests();
      setRequests(updatedRequests);
    } catch (error) {
      console.error('Failed to update request status:', error);
      alert('Failed to update request status. Please try again.');
    }
  };

  /**
   * Handle toggling request status (new → pending → complete)
   * @param requestId - ID of the request
   * @param newStatus - New status to set
   */
  const handleToggleStatus = async (requestId: string, newStatus: 'new' | 'pending' | 'complete') => {
    try {
      await apiService.updateRequestStatus(requestId, newStatus);
      // Reload requests from API
      const updatedRequests = await apiService.getRequests();
      setRequests(updatedRequests);
    } catch (error) {
      console.error('Failed to update request status:', error);
      alert('Failed to update request status. Please try again.');
    }
  };

  /**
   * Handle adding comment to a request
   * @param requestId - ID of the request to add comment to
   */
  const handleAddComment = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setSelectedRequestForComment(request);
      setShowCommentModal(true);
    }
  };

  /**
   * Handle saving comment
   * @param requestId - ID of the request
   * @param comment - Comment text
   * @param isAdmin - Whether this is an admin comment
   */
  const handleSaveComment = async (requestId: string, comment: string, isAdmin: boolean) => {
    console.log('App: handleSaveComment called with:', { requestId, comment, isAdmin });
    try {
      console.log('App: Calling apiService.addComment...');
      const result = await apiService.addComment(requestId, comment, isAdmin);
      console.log('App: Comment added successfully:', result);
      
      // Reload requests from API
      console.log('App: Reloading requests...');
      const updatedRequests = await apiService.getRequests();
      console.log('App: Updated requests:', updatedRequests);
      setRequests(updatedRequests);
      console.log('App: Requests reloaded successfully');
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
      throw error; // Re-throw to let the CommentModal handle it
    }
  };

  /**
   * Handle deleting a request
   * @param requestId - ID of the request to delete
   */
  const handleDeleteRequest = async (requestId: string) => {
    if (window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      try {
        await apiService.deleteRequest(requestId);
        // Reload requests from API
        const updatedRequests = await apiService.getRequests();
        setRequests(updatedRequests);
      } catch (error) {
        console.error('Failed to delete request:', error);
        alert('Failed to delete request. Please try again.');
      }
    }
  };

  /**
   * Handle admin authentication
   * @param authenticated - Whether admin is authenticated
   */
  const handleAdminAuth = (authenticated: boolean) => {
    setIsAdmin(authenticated);
    setShowAdminAuth(false);
  };

  /**
   * Handle importing data from admin panel
   * @param importedRequests - Array of imported requests
   */
  const handleImportData = async (importedRequests: MediaRequest[]) => {
    // For now, we'll just set the requests locally
    // In a full implementation, you might want to send these to the API
    setRequests(importedRequests);
    console.log('Import functionality would need to be implemented with API calls');
  };

  /**
   * Handle clearing search results
   */
  const handleClearSearch = () => {
    setSearchResults([]);
    setCurrentSearchQuery('');
    setIsLoading(false);
  };

  /**
   * Toggle admin mode
   */
  const toggleAdminMode = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setShowAdminAuth(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Family Media Request Tool
              </h1>
              <p className="text-sm text-gray-600">
                Request movies and TV shows for your Plex server
              </p>
            </div>
            <div className="flex space-x-3">
              {isAdmin && (
                <button
                  onClick={() => setShowAdminPanel(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors duration-200"
                >
                  Data Management
                </button>
              )}
              <button
                onClick={toggleAdminMode}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isAdmin
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isAdmin ? 'Exit Admin' : 'Admin Mode'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search section */}
        <div className="mb-8">
          <SearchBar 
            onSearch={handleSearch} 
            onClearSearch={handleClearSearch} 
            isLoading={isLoading}
          />
          <SearchResults
            results={searchResults}
            onRequest={handleRequestClick}
            onShowDetails={handleShowTVDetails}
            onGoToRequest={handleGoToRequest}
            onClearResults={handleClearSearch}
            isLoading={isLoading}
            searchQuery={currentSearchQuery}
            existingRequests={(() => {
              const existingMap = new Map<string, boolean>();
              searchResults.forEach(result => {
                const existingRequest = findExistingRequest(result.id, result.media_type, null);
                if (existingRequest && (existingRequest.status === 'new' || existingRequest.status === 'pending')) {
                  existingMap.set(`${result.media_type}-${result.id}`, true);
                }
              });
              return existingMap;
            })()}
          />
        </div>

        {/* Requests section */}
        <div className="mt-12">
          <RequestList
            requests={requests}
            onMarkComplete={handleMarkComplete}
            onToggleStatus={handleToggleStatus}
            onAddComment={handleAddComment}
            onDeleteRequest={handleDeleteRequest}
            isAdmin={isAdmin}
          />
        </div>
      </main>

      {/* Request modal */}
      <RequestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
          setRequestDetails(null);
        }}
        onConfirm={handleAddRequest}
        selectedItem={selectedItem}
        requestType={requestType}
        requestDetails={requestDetails || undefined}
      />

      {/* TV Show Details modal */}
      {showTVDetails && (
        <TVShowDetails
          show={showTVDetails}
          onRequest={handleTVRequest}
          onGoToRequest={handleTVGoToRequest}
          hasExistingRequest={hasExistingRequest}
          onClose={() => setShowTVDetails(null)}
        />
      )}

      {/* Admin Authentication modal */}
      <AdminAuth
        isOpen={showAdminAuth}
        onClose={() => setShowAdminAuth(false)}
        onAuthenticate={handleAdminAuth}
      />

      {/* Comment modal */}
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => {
          setShowCommentModal(false);
          setSelectedRequestForComment(null);
        }}
        request={selectedRequestForComment}
        onAddComment={handleSaveComment}
        isAdmin={isAdmin}
      />

      {/* Existing Request modal */}
      <ExistingRequestModal
        isOpen={!!showExistingRequest}
        onClose={() => setShowExistingRequest(null)}
        request={showExistingRequest}
      />

      {/* Admin Panel */}
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        requests={requests}
        onImportData={handleImportData}
      />
    </div>
  );
};

export default App;
