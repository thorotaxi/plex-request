import React, { useState, useEffect } from 'react';
import { RequestModalProps } from '../types';
import { tmdbApi } from '../services/tmdbApi';
import ImageWithFallback from './ImageWithFallback';

/**
 * Modal component for adding new media requests
 */
const RequestModal: React.FC<RequestModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedItem,
  requestType,
  requestDetails
}) => {
  const [requesterName, setRequesterName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setRequesterName('');
      setComment('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requesterName.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsSubmitting(true);
    onConfirm(requesterName.trim(), comment.trim() || undefined);
  };

  const getTitle = (): string => {
    if (!selectedItem) return '';
    
    let title = selectedItem.title || selectedItem.name || 'Unknown Title';
    
    if (requestType === 'season' && requestDetails?.seasonNumber) {
      title += ` - Season ${requestDetails.seasonNumber}`;
    } else if (requestType === 'episode' && requestDetails?.episodeNumber && requestDetails?.episodeTitle) {
      title += ` - S${requestDetails.seasonNumber}E${requestDetails.episodeNumber}: ${requestDetails.episodeTitle}`;
    }
    
    return title;
  };

  const getTypeLabel = (): string => {
    switch (requestType) {
      case 'movie': return 'Movie';
      case 'tv': return 'TV Show';
      case 'season': return 'Season';
      case 'episode': return 'Episode';
      default: return 'Media';
    }
  };

  if (!isOpen || !selectedItem) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Request {getTypeLabel()}
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

          {/* Media Preview */}
          <div className="flex items-start space-x-4 mb-6">
            <div className="flex-shrink-0">
              <div className={`w-16 h-24 flex items-center justify-center rounded ${
                selectedItem.media_type === 'movie' ? 'bg-red-50' : 'bg-indigo-50'
              }`}>
                <ImageWithFallback
                  src={tmdbApi.getPosterUrl(selectedItem.poster_path)}
                  alt={getTitle()}
                  className="w-full h-full object-contain rounded"
                  fallbackSrc="/placeholder-poster.svg"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                {getTitle()}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {getTypeLabel()}
              </p>
              {selectedItem.overview && (
                <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                  {selectedItem.overview}
                </p>
              )}
            </div>
          </div>

          {/* Request Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="requesterName" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                id="requesterName"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                Comment (Optional)
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any additional comments..."
                disabled={isSubmitting}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || !requesterName.trim()}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestModal;

