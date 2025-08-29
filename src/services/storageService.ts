import { MediaRequest } from '../types';

const STORAGE_KEY = 'plex-requests-data';

export interface StorageData {
  requests: MediaRequest[];
  lastUpdated: string;
}

/**
 * Service to handle data persistence using localStorage
 */
class StorageService {
  /**
   * Save requests data to localStorage
   */
  saveRequests(requests: MediaRequest[]): void {
    try {
      const data: StorageData = {
        requests: requests.map(request => ({
          ...request,
          // Ensure dates are properly serialized
          requestDate: new Date(request.requestDate),
          completedDate: request.completedDate ? new Date(request.completedDate) : undefined
        })),
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log(`Saved ${requests.length} requests to localStorage`);
    } catch (error) {
      console.error('Failed to save requests to localStorage:', error);
      // Fallback: try to save just the requests array
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
      } catch (fallbackError) {
        console.error('Fallback save also failed:', fallbackError);
      }
    }
  }

  /**
   * Load requests data from localStorage
   */
  loadRequests(): MediaRequest[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        console.log('No stored data found, returning empty array');
        return [];
      }

      const data = JSON.parse(stored);
      
      // Handle both new format (StorageData) and old format (just array)
      let requests: MediaRequest[];
      if (data.requests && Array.isArray(data.requests)) {
        requests = data.requests;
      } else if (Array.isArray(data)) {
        requests = data;
      } else {
        console.warn('Invalid data format in localStorage, returning empty array');
        return [];
      }

      // Convert date strings back to Date objects
      const processedRequests = requests.map(request => ({
        ...request,
        requestDate: new Date(request.requestDate),
        completedDate: request.completedDate ? new Date(request.completedDate) : undefined
      }));

      console.log(`Loaded ${processedRequests.length} requests from localStorage`);
      return processedRequests;
    } catch (error) {
      console.error('Failed to load requests from localStorage:', error);
      return [];
    }
  }

  /**
   * Clear all stored data
   */
  clearData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Cleared all stored data');
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  /**
   * Get storage statistics
   */
  getStorageInfo(): { size: number; lastUpdated?: string } {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return { size: 0 };
      }

      const data = JSON.parse(stored);
      return {
        size: stored.length,
        lastUpdated: data.lastUpdated || 'Unknown'
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { size: 0 };
    }
  }

  /**
   * Export data as JSON string
   */
  exportData(): string {
    try {
      const requests = this.loadRequests();
      return JSON.stringify(requests, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return '[]';
    }
  }

  /**
   * Import data from JSON string
   */
  importData(jsonData: string): MediaRequest[] {
    try {
      const parsed = JSON.parse(jsonData);
      if (!Array.isArray(parsed)) {
        throw new Error('Imported data is not an array');
      }

      // Validate and process the imported data
      const validRequests = parsed.filter((item: any) => {
        return item && 
               typeof item.id === 'string' &&
               typeof item.title === 'string' &&
               typeof item.type === 'string' &&
               typeof item.status === 'string' &&
               typeof item.requesterName === 'string' &&
               item.requestDate;
      });

      console.log(`Imported ${validRequests.length} valid requests from ${parsed.length} total items`);
      return validRequests;
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Invalid data format');
    }
  }
}

export const storageService = new StorageService();

