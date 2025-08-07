/**
 * Base API Client
 * Centralized HTTP client for all API requests with interceptors and error handling
 */

import { config } from '@/constants/config';
import { createNetworkError, createAPIError, ErrorType } from '@/utils/errorHandler';
import type { ApiResponse } from '@/types/common';

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

interface ApiClientOptions {
  baseURL?: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(options: ApiClientOptions = {}) {
    this.baseURL = options.baseURL || config.apiBaseUrl;
    this.timeout = options.timeout || 10000; // 10 seconds default
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.defaultHeaders,
    };
  }

  private async request<T = unknown>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.timeout,
    } = config;

    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    const requestInit: RequestInit = {
      method,
      headers: requestHeaders,
      ...(body && { body: JSON.stringify(body) }),
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...requestInit,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        const apiError = createAPIError(
          `HTTP ${response.status}: ${errorText}`,
          response.status,
          response.status.toString()
        );
        
        return {
          success: false,
          error: apiError.userMessage || apiError.message,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const timeoutError = createNetworkError('Request timeout');
          return {
            success: false,
            error: timeoutError.userMessage || timeoutError.message,
          };
        }
        
        const networkError = createNetworkError(error.message);
        return {
          success: false,
          error: networkError.userMessage || networkError.message,
        };
      }
      
      const unknownError = createNetworkError('Unknown error occurred');
      return {
        success: false,
        error: unknownError.userMessage || unknownError.message,
      };
    }
  }

  // HTTP Methods
  async get<T = unknown>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { 
      method: 'GET', 
      ...(headers && { headers }) 
    });
  }

  async post<T = unknown>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { 
      method: 'POST', 
      body: data, 
      ...(headers && { headers }) 
    });
  }

  async put<T = unknown>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { 
      method: 'PUT', 
      body: data, 
      ...(headers && { headers }) 
    });
  }

  async patch<T = unknown>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { 
      method: 'PATCH', 
      body: data, 
      ...(headers && { headers }) 
    });
  }

  async delete<T = unknown>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { 
      method: 'DELETE', 
      ...(headers && { headers }) 
    });
  }

  // Utility methods
  setAuthToken(token: string): void {
    this.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.defaultHeaders.Authorization;
  }

  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export the class for custom instances if needed
export { ApiClient };
export type { RequestConfig, ApiClientOptions };