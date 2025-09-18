import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { config } from '@/constants/config';
import { createNetworkError, createAPIError } from '@/utils/errorHandler';
import type { ApiResponse } from '@/types/common';

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

interface ApiClient {
  get<T = unknown>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>>;
  post<T = unknown>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>>;
  put<T = unknown>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>>;
  patch<T = unknown>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>>;
  delete<T = unknown>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>>;
}

interface ApiContextType {
  client: ApiClient;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  const request = async <T = unknown>(
    endpoint: string,
    requestConfig: RequestConfig = {}
  ): Promise<ApiResponse<T>> => {
    const url = `${config.apiBaseUrl}${endpoint}`;
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 10000,
    } = requestConfig;

    try {
      console.log('🌐 ApiClient: Making request to:', url);
      console.log('🌐 ApiClient: Method:', method);
      console.log('🌐 ApiClient: Body:', body);
      
      const token = await getToken({template: "seller_app"});
      console.log('🔑 ApiClient: Got token:', token ? 'YES' : 'NO');
      
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      };

      // Add auth token if available
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }

      console.log('📋 ApiClient: Request headers:', requestHeaders);

      const requestInit: RequestInit = {
        method,
        headers: requestHeaders,
        ...(body && { body: JSON.stringify(body) }),
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...requestInit,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      console.log('📥 ApiClient: Response status:', response.status, response.statusText);
      console.log('📥 ApiClient: Response ok:', response.ok);


      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ ApiClient: Response not ok - status:', response.status, 'error text:', errorText);
        
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

      try {
        const data = await response.json();
        console.log('✅ ApiClient: Success response data:', data);
        console.log('✅ ApiClient: Response data type:', typeof data, 'Is Array:', Array.isArray(data));
        return {
          success: true,
          data,
        };
      } catch (jsonError) {
        // If response is not valid JSON, treat as API error
        const apiError = createAPIError(
          `Invalid response format: ${jsonError instanceof Error ? jsonError.message : 'Unknown JSON error'}`,
          response.status,
          'INVALID_JSON'
        );
        
        return {
          success: false,
          error: apiError.userMessage || apiError.message,
        };
      }
    } catch (error) {
      console.log('❌ ApiClient: Caught error:', error);
      console.log('❌ ApiClient: Error type:', typeof error);
      console.log('❌ ApiClient: Error name:', error instanceof Error ? error.name : 'Not an Error object');
      console.log('❌ ApiClient: Error message:', error instanceof Error ? error.message : String(error));
      
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
  };

  const client: ApiClient = {
    async get<T = unknown>(
      endpoint: string,
      headers?: Record<string, string>
    ): Promise<ApiResponse<T>> {
      return request<T>(endpoint, { 
        method: 'GET', 
        ...(headers && { headers }) 
      });
    },

    async post<T = unknown>(
      endpoint: string,
      data?: any,
      headers?: Record<string, string>
    ): Promise<ApiResponse<T>> {
      return request<T>(endpoint, { 
        method: 'POST', 
        body: data, 
        ...(headers && { headers }) 
      });
    },

    async put<T = unknown>(
      endpoint: string,
      data?: any,
      headers?: Record<string, string>
    ): Promise<ApiResponse<T>> {
      return request<T>(endpoint, { 
        method: 'PUT', 
        body: data, 
        ...(headers && { headers }) 
      });
    },

    async patch<T = unknown>(
      endpoint: string,
      data?: any,
      headers?: Record<string, string>
    ): Promise<ApiResponse<T>> {
      return request<T>(endpoint, { 
        method: 'PATCH', 
        body: data, 
        ...(headers && { headers }) 
      });
    },

    async delete<T = unknown>(
      endpoint: string,
      headers?: Record<string, string>
    ): Promise<ApiResponse<T>> {
      return request<T>(endpoint, { 
        method: 'DELETE', 
        ...(headers && { headers }) 
      });
    },
  };

  const contextValue: ApiContextType = {
    client,
    isAuthenticated: isSignedIn || false,
    isLoading: !isLoaded,
  };

  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi(): ApiContextType {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}

export type { ApiClient, ApiContextType };