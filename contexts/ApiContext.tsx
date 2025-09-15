/**
 * API Context
 * Centralized API client with Clerk authentication and error handling
 */

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
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> => {
    const url = `${config.apiBaseUrl}${endpoint}`;
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 10000,
    } = config;

    try {
      // Get Clerk token
      const token = await getToken();
      
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      };

      // Add auth token if available
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }

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