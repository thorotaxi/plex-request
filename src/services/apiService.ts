import { MediaRequest } from '../types';
import { getApiBaseUrl } from '../config/api';

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('🌐 Making request to:', url);
    console.log('📤 Request options:', options);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'bypass-tunnel-reminder': 'true',
        ...options.headers,
      },
      ...options,
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Response error:', errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Response data:', result);
    return result;
  }

  // Get all requests
  async getRequests(): Promise<MediaRequest[]> {
    return this.request<MediaRequest[]>('/requests');
  }

  // Create a new request
  async createRequest(request: Omit<MediaRequest, 'id' | 'requestDate'>): Promise<{ message: string; id: string }> {
    const requestBody = {
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
    };
    
    console.log('🚀 Creating request with data:', requestBody);
    console.log('🌐 API URL:', `${API_BASE_URL}/requests`);
    
    try {
      const result = await this.request<{ message: string; id: string }>('/requests', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      console.log('✅ Request created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to create request:', error);
      throw error;
    }
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

