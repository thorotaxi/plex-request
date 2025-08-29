import React, { useState, useMemo } from 'react';
import { MediaRequest } from '../types';
import RequestCard from './RequestCard';

interface RequestListProps {
  requests: MediaRequest[];
  onMarkComplete: (requestId: string) => void;
  onToggleStatus: (requestId: string, newStatus: 'pending' | 'complete') => void;
  onAddComment: (requestId: string) => void;
  onDeleteRequest: (requestId: string) => void;
  isAdmin?: boolean;
}

/**
 * Component to display and manage media requests with filtering and pagination
 */
const RequestList: React.FC<RequestListProps> = ({ 
  requests, 
  onMarkComplete, 
  onToggleStatus,
  onAddComment,
  onDeleteRequest,
  isAdmin = false 
}) => {
  const [filterRequester, setFilterRequester] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'pending' | 'complete'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 25;

  // Filter and sort requests
  const filteredAndSortedRequests = useMemo(() => {
    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

    return requests
      .filter(request => {
        // Hide completed requests older than 60 days
        if (request.status === 'complete' && request.completedDate && request.completedDate < sixtyDaysAgo) {
          return false;
        }
        
        // Filter by requester name
        if (filterRequester && !request.requesterName.toLowerCase().includes(filterRequester.toLowerCase())) {
          return false;
        }
        
        // Filter by status
        if (filterStatus !== 'all' && request.status !== filterStatus) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()); // Most recent first
  }, [requests, filterRequester, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedRequests.length / requestsPerPage);
  const startIndex = (currentPage - 1) * requestsPerPage;
  const endIndex = startIndex + requestsPerPage;
  const currentRequests = filteredAndSortedRequests.slice(startIndex, endIndex);

  // Get unique requester names for filter dropdown
  const uniqueRequesters = useMemo(() => {
    const requesters = new Set(requests.map(r => r.requesterName));
    return Array.from(requesters).sort();
  }, [requests]);

  const handleFilterChange = (value: string) => {
    setFilterRequester(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleStatusFilterChange = (value: 'all' | 'new' | 'pending' | 'complete') => {
    setFilterStatus(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const newCount = filteredAndSortedRequests.filter(r => r.status === 'new').length;
  const pendingCount = filteredAndSortedRequests.filter(r => r.status === 'pending').length;
  const completedCount = filteredAndSortedRequests.filter(r => r.status === 'complete').length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Media Requests</h2>
                     <div className="flex space-x-4 text-sm text-gray-600">
             <span>Total: {filteredAndSortedRequests.length}</span>
             <span>New: {newCount}</span>
             <span>Pending: {pendingCount}</span>
             <span>Completed: {completedCount}</span>
           </div>
        </div>
        
        {/* Filters */}
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-4">
          <div>
            <label htmlFor="requesterFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Requester
            </label>
            <select
              id="requesterFilter"
              value={filterRequester}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Requesters</option>
              {uniqueRequesters.map(requester => (
                <option key={requester} value={requester}>
                  {requester}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={(e) => handleStatusFilterChange(e.target.value as 'all' | 'pending' | 'complete')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
                             <option value="all">All Status</option>
               <option value="new">New</option>
               <option value="pending">Pending</option>
               <option value="complete">Complete</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Grid */}
      {currentRequests.length > 0 ? (
        <div className="space-y-4">
          {currentRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onMarkComplete={onMarkComplete}
              onToggleStatus={onToggleStatus}
              onAddComment={onAddComment}
              onDeleteRequest={onDeleteRequest}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            {filterRequester || filterStatus !== 'all'
              ? `No requests found${filterRequester ? ` for "${filterRequester}"` : ''}${filterStatus !== 'all' ? ` with status "${filterStatus}"` : ''}`
              : 'No requests found'
            }
          </div>
          {(filterRequester || filterStatus !== 'all') && (
            <button
              onClick={() => {
                handleFilterChange('');
                handleStatusFilterChange('all');
              }}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedRequests.length)} of {filteredAndSortedRequests.length} requests
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Info about hidden requests */}
      {isAdmin && (
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> Completed requests older than 60 days are automatically hidden to keep the list manageable.
          </p>
        </div>
      )}
    </div>
  );
};

export default RequestList;
