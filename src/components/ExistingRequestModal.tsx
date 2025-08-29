import React from 'react';
import { MediaRequest } from '../types';
import { tmdbApi } from '../services/tmdbApi';
import ImageWithFallback from './ImageWithFallback';

interface ExistingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: MediaRequest | null;
}

/**
 * Modal to display existing request when duplicate is detected
 */
const ExistingRequestModal: React.FC<ExistingRequestModalProps> = ({
  isOpen,
  onClose,
  request
}) => {
  if (!isOpen || !request) return null;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Existing Request Found
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

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Duplicate Request Detected
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This item has already been requested and is currently {request.status === 'new' ? 'new' : 'pending'}. 
                    You can view the existing request below.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className={`w-24 h-36 flex items-center justify-center rounded ${
                  request.type === 'movie' ? 'bg-red-50' : 'bg-indigo-50'
                }`}>
                  <ImageWithFallback
                    src={tmdbApi.getPosterUrl(request.posterPath)}
                    alt={request.title}
                    className="w-full h-full object-contain rounded"
                    fallbackSrc="/placeholder-poster.svg"
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {request.title}
                  </h3>
                  <div className="flex space-x-2 ml-2">
                    {getStatusBadge(request.status)}
                  </div>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
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
                    <p className="mt-2 p-2 bg-white rounded text-gray-700">
                      <span className="font-medium">User Comment:</span> {request.comment}
                    </p>
                  )}
                  {request.adminComment && (
                    <p className="mt-2 p-2 bg-blue-50 rounded text-gray-700 border-l-4 border-blue-400">
                      <span className="font-medium text-blue-800">Admin Comment:</span> {request.adminComment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExistingRequestModal;


