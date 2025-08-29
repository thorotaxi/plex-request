import { MediaRequest } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get all requests
  async getRequests(): Promise<MediaRequest[]> {
    return this.request<MediaRequest[]>('/requests');
  }

  // Create a new request
  async createRequest(request: Omit<MediaRequest, 'id' | 'requestDate'>): Promise<{ message: string; id: string }> {
    return this.request<{ message: string; id: string }>('/requests', {
      method: 'POST',
      body: JSON.stringify({
        tmdbId: request.tmdbId,
        title: request.title,
        type: request.type,
        requesterName: request.requesterName,
        posterPath: request.posterPath,
        comment: request.comment,
        showId: request.showId,
        showTitle: request.showTitle,
        seasonNumber: request.seasonNumber,
        episodeNumber: request.episodeNumber,
        episodeTitle: request.episodeTitle,
      }),
    });
  }

  // Update request status
  async updateRequestStatus(id: string, status: MediaRequest['status']): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Add comment to request
  async addComment(id: string, comment: string, isAdmin: boolean = false): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/requests/${id}/comment`, {
      method: 'PATCH',
      body: JSON.stringify({ comment, isAdmin }),
    });
  }

  // Delete request
  async deleteRequest(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/requests/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

export const apiService = new ApiService();

