/**
 * Centralized API Client for ft_transcendence
 * Handles all HTTP requests with proper CORS, credentials, and error handling
 */

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_ORIGIN || 'http://localhost:3000';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  token?: string;
  credentials?: RequestCredentials;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make an API request with proper CORS and credentials
   */
  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      token,
      credentials = 'include',
    } = options;

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials,
        mode: 'cors',
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data: any;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      if (!response.ok) {
        return {
          error: data.error || data.message || `HTTP ${response.status}`,
          message: data.message,
          statusCode: response.status,
          data: data,
        };
      }

      return {
        data,
        statusCode: response.status,
      };
    } catch (error: any) {
      console.error('[ApiClient] Request failed:', error);
      return {
        error: 'Network error or server unavailable',
        message: error.message || 'Failed to connect to server',
        statusCode: 0,
      };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, body?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, body?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, body?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  /**
   * Upload file with multipart/form-data
   */
  async uploadFile<T = any>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    options: Omit<ApiRequestOptions, 'method' | 'body' | 'headers'> = {}
  ): Promise<ApiResponse<T>> {
    const { token, credentials = 'include' } = options;
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const requestHeaders: Record<string, string> = {};
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: requestHeaders,
        body: formData,
        credentials,
        mode: 'cors',
      });

      const contentType = response.headers.get('content-type');
      let data: any;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      if (!response.ok) {
        return {
          error: data.error || data.message || `HTTP ${response.status}`,
          message: data.message,
          statusCode: response.status,
          data: data,
        };
      }

      return {
        data,
        statusCode: response.status,
      };
    } catch (error: any) {
      console.error('[ApiClient] File upload failed:', error);
      return {
        error: 'Network error or server unavailable',
        message: error.message || 'Failed to upload file',
        statusCode: 0,
      };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export default ApiClient;
