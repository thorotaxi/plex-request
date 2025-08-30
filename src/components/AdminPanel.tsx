import React, { useState } from 'react';
import { MediaRequest } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  requests: MediaRequest[];
  onImportData: (requests: MediaRequest[]) => void;
}

/**
 * Admin panel for data management and storage operations
 */
const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  requests,
  onImportData
}) => {
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  // For now, we'll use basic storage info since we're using API
  const storageInfo = {
    size: JSON.stringify(requests).length,
    lastUpdated: new Date().toISOString()
  };

  const handleExport = () => {
    try {
      const data = JSON.stringify(requests, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plex-requests-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImport = () => {
    try {
      setImportError('');
      const importedRequests = JSON.parse(importData);
      if (!Array.isArray(importedRequests)) {
        throw new Error('Data must be an array of requests');
      }
      onImportData(importedRequests);
      setImportData('');
      alert(`Successfully imported ${importedRequests.length} requests!`);
    } catch (error) {
      setImportError('Invalid data format. Please check your JSON file.');
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear ALL data? This action cannot be undone!')) {
      onImportData([]);
      alert('All data has been cleared.');
    }
  };

  const handleResetToSample = () => {
    if (window.confirm('This will replace all current data with sample data. Continue?')) {
      const sampleRequests: MediaRequest[] = [
        {
          id: '1',
          tmdbId: 1,
          title: 'The Shawshank Redemption',
          type: 'movie',
          status: 'new',
          requesterName: 'John Doe',
          posterPath: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
          requestDate: new Date('2024-01-15'),
          comment: 'Great classic movie!'
        },
        {
          id: '2',
          tmdbId: 2,
          title: 'Breaking Bad',
          type: 'tv',
          status: 'complete',
          requesterName: 'Jane Smith',
          posterPath: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
          requestDate: new Date('2024-01-10'),
          completedDate: new Date('2024-01-12'),
          adminComment: 'Added to Plex server'
        }
      ];
      onImportData(sampleRequests);
      alert('Reset to sample data complete!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Storage Statistics */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Storage Statistics</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Total Requests:</span>
                <span className="ml-2 text-gray-900">{requests.length}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Storage Size:</span>
                <span className="ml-2 text-gray-900">{storageInfo.size} bytes</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Last Updated:</span>
                <span className="ml-2 text-gray-900">
                  {storageInfo.lastUpdated ? new Date(storageInfo.lastUpdated).toLocaleString() : 'Unknown'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Storage Type:</span>
                <span className="ml-2 text-gray-900">API Database</span>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Export Data</h3>
            <p className="text-sm text-gray-600 mb-3">
              Download all requests as a JSON file for backup or migration.
            </p>
            <button
              onClick={handleExport}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Export All Data
            </button>
            {exportSuccess && (
              <p className="text-green-600 text-sm mt-2">✓ Export successful!</p>
            )}
          </div>

          {/* Import Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Import Data</h3>
            <p className="text-sm text-gray-600 mb-3">
              Import requests from a JSON file. This will replace all current data.
            </p>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste JSON data here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {importError && (
              <p className="text-red-600 text-sm mt-2">{importError}</p>
            )}
            <div className="mt-3 space-x-3">
              <button
                onClick={handleImport}
                disabled={!importData.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import Data
              </button>
              <button
                onClick={() => setImportData('')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Data Management */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Management</h3>
            <div className="space-y-3">
              <button
                onClick={handleResetToSample}
                className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Reset to Sample Data
              </button>
              <button
                onClick={handleClearData}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Clear All Data
              </button>
            </div>
          </div>

          {/* Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">About Data Storage</h3>
            <p className="text-sm text-blue-800">
              All data is stored in a local SQLite database. This means:
            </p>
            <ul className="text-sm text-blue-800 mt-2 list-disc list-inside space-y-1">
              <li>Data persists between server restarts</li>
              <li>Data is stored on the local server</li>
              <li>Multiple users can access the same data</li>
              <li>Use export/import for backup and migration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

