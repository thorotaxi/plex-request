import React from 'react';
import { MediaRequest } from '../types';
import { tmdbApi } from '../services/tmdbApi';
import ImageWithFallback from './ImageWithFallback';

interface RequestCardProps {
  request: MediaRequest;
  onMarkComplete: (requestId: string) => void;
  onToggleStatus: (requestId: string, newStatus: 'pending' | 'complete') => void;
  onAddComment: (requestId: string) => void;
  onDeleteRequest: (requestId: string) => void;
  isAdmin?: boolean;
}

/**
 * Component to display individual media requests with status and actions
 */
const RequestCard: React.FC<RequestCardProps> = ({ 
  request, 
  onMarkComplete, 
  onToggleStatus,
  onAddComment,
  onDeleteRequest,
  isAdmin = false 
}) => {
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: 'new' | 'pending' | 'complete') => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    
    if (status === 'new') {
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
          New
        </span>
      );
    } else if (status === 'pending') {
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
          Pending
        </span>
      );
    } else {
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800`}>
          Complete
        </span>
      );
    }
  };

  const getTypeBadge = (type: 'movie' | 'tv' | 'season' | 'episode') => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    
    if (type === 'movie') {
      return (
        <span className={`${baseClasses} bg-red-100 text-red-800`}>
          Movie
        </span>
      );
    } else if (type === 'tv') {
      return (
        <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>
          TV Show
        </span>
      );
    } else if (type === 'season') {
      return (
        <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>
          Season
        </span>
      );
    } else {
      return (
        <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>
          Episode
        </span>
      );
    }
  };

  const handleMarkPending = () => {
    onToggleStatus(request.id, 'pending');
  };

  const handleMarkComplete = () => {
    onToggleStatus(request.id, 'complete');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-100">
      <div className="flex">
        <div className="flex-shrink-0">
          <div className={`w-24 h-36 flex items-center justify-center ${
            request.type === 'movie' ? 'bg-red-50' : 'bg-indigo-50'
          }`}>
            <ImageWithFallback
              src={tmdbApi.getPosterUrl(request.posterPath)}
              alt={request.title}
              className="w-full h-full object-contain"
              fallbackSrc="/placeholder-poster.svg"
            />
          </div>
        </div>
        
        <div className="flex-1 p-4 flex flex-col h-full">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {request.title}
            </h3>
            <div className="flex space-x-2 ml-2">
              {getStatusBadge(request.status)}
            </div>
          </div>
          
          <div className="flex-1 space-y-1 text-sm text-gray-600">
            <div className="flex items-center space-x-2 mb-2">
              {getTypeBadge(request.type)}
              <span className="text-gray-500">•</span>
              <span>Requested by {request.requesterName}</span>
            </div>
            <p>
              <span className="font-medium">Requested on:</span> {formatDate(request.requestDate)}
            </p>
            {request.completedDate && (
              <p>
                <span className="font-medium">Completed on:</span> {formatDate(request.completedDate)}
              </p>
            )}
            {request.comment && (
              <p className="mt-2 p-2 bg-gray-50 rounded text-gray-700">
                <span className="font-medium">User Comment:</span> {request.comment}
              </p>
            )}
            {request.adminComment && (
              <p className="mt-2 p-2 bg-blue-50 rounded text-gray-700 border-l-4 border-blue-400">
                <span className="font-medium text-blue-800">Admin Comment:</span> {request.adminComment}
              </p>
            )}
          </div>
          
          <div className="mt-3 flex space-x-2 mt-auto">
            {/* Everyone can add comments */}
            <button
              onClick={() => onAddComment(request.id)}
              className="bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 text-sm font-medium"
            >
              Add Comment
            </button>
            
            {/* Admin-only actions */}
            {isAdmin && (
              <>
                {/* Show appropriate status buttons based on current status */}
                {request.status === 'new' && (
                  <>
                    <button
                      onClick={handleMarkPending}
                      className="bg-yellow-600 text-white py-1 px-3 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors duration-200 text-sm font-medium"
                    >
                      Mark Pending
                    </button>
                    <button
                      onClick={handleMarkComplete}
                      className="bg-green-600 text-white py-1 px-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 text-sm font-medium"
                    >
                      Mark Complete
                    </button>
                  </>
                )}
                {request.status === 'pending' && (
                  <button
                    onClick={handleMarkComplete}
                    className="bg-green-600 text-white py-1 px-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 text-sm font-medium"
                  >
                    Mark Complete
                  </button>
                )}
                {request.status === 'complete' && (
                  <button
                    onClick={handleMarkPending}
                    className="bg-yellow-600 text-white py-1 px-3 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors duration-200 text-sm font-medium"
                  >
                    Mark Pending
                  </button>
                )}
                <button
                  onClick={() => onDeleteRequest(request.id)}
                  className="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 text-sm font-medium"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
