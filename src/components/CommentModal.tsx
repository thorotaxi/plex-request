import React, { useState, useEffect } from 'react';
import { CommentModalProps } from '../types';

/**
 * Modal component for adding comments to media requests
 */
const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  request,
  onAddComment,
  isAdmin
}) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setComment('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('CommentModal: handleSubmit called', { comment, request, isAdmin });
    
    if (!comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    if (!request) {
      console.error('CommentModal: Cannot submit comment - request is null');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('CommentModal: Calling onAddComment with:', { requestId: request.id, comment: comment.trim(), isAdmin });
      await onAddComment(request.id, comment.trim(), isAdmin);
      console.log('CommentModal: Comment added successfully');
      onClose();
    } catch (error) {
      console.error('CommentModal: Error submitting comment:', error);
      setIsSubmitting(false);
      alert('Failed to save comment. Please try again.');
    }
  };

  // Note: getCurrentComment function is available for future use
  // const getCurrentComment = (): string => {
  //   if (!request) return '';
  //   return isAdmin ? (request.adminComment || '') : (request.comment || '');
  // };

  const getCommentLabel = (): string => {
    return isAdmin ? 'Admin Comment' : 'User Comment';
  };

  const getCommentPlaceholder = (): string => {
    return isAdmin 
      ? 'Add an admin comment or note about this request...'
      : 'Add a comment about your request...';
  };

  if (!isOpen) return null;
  
  if (!request) {
    console.error('CommentModal: request prop is null or undefined');
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Add {getCommentLabel()}
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

          {/* Request Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              {request.title}
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Requested by:</span> {request.requesterName}
              </p>
              <p>
                <span className="font-medium">Status:</span> 
                <span className={`ml-1 px-2 py-1 text-xs font-medium rounded-full ${
                  request.status === 'new' ? 'bg-blue-100 text-blue-800' :
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </p>
              <p>
                <span className="font-medium">Requested on:</span> {formatDate(request.requestDate)}
              </p>
            </div>
          </div>

          {/* Current Comments */}
          {(request.comment || request.adminComment) && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Comments:</h4>
              <div className="space-y-3">
                {request.comment && (
                  <div className="p-3 bg-blue-50 rounded-md border-l-4 border-blue-400">
                    <p className="text-sm font-medium text-blue-800 mb-1">User Comment:</p>
                    <p className="text-sm text-gray-700">{request.comment}</p>
                  </div>
                )}
                {request.adminComment && (
                  <div className="p-3 bg-purple-50 rounded-md border-l-4 border-purple-400">
                    <p className="text-sm font-medium text-purple-800 mb-1">Admin Comment:</p>
                    <p className="text-sm text-gray-700">{request.adminComment}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                {getCommentLabel()} *
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={getCommentPlaceholder()}
                required
                disabled={isSubmitting}
                autoFocus
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
                disabled={isSubmitting || !comment.trim()}
              >
                {isSubmitting ? 'Saving...' : 'Save Comment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
