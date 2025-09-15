/**
 * User Service
 * Handles user-related API operations
 */

import type { ApiClient } from '@/contexts/ApiContext';
import { API_ENDPOINTS } from '@/constants/config';
import type { ApiResponse } from '@/types/common';

// User types - extend based on your backend models
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  addresses?: UserAddress[];
  preferences?: UserPreferences;
}

export interface UserAddress {
  id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface UserPreferences {
  notifications: boolean;
  locationTracking: boolean;
  marketingEmails: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export const userService = {
  /**
   * Get user profile
   */
  async getProfile(client: ApiClient): Promise<ApiResponse<UserProfile>> {
    try {
      return await client.get<UserProfile>(API_ENDPOINTS.user.profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user profile',
      };
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(
    client: ApiClient,
    profileData: UpdateUserProfileRequest
  ): Promise<ApiResponse<UserProfile>> {
    try {
      return await client.put<UserProfile>(API_ENDPOINTS.user.update, profileData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user profile',
      };
    }
  },

  /**
   * Add user address
   */
  async addAddress(
    client: ApiClient,
    address: Omit<UserAddress, 'id'>
  ): Promise<ApiResponse<UserAddress>> {
    try {
      return await client.post<UserAddress>('/api/user/addresses', address);
    } catch (error) {
      console.error('Error adding user address:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add address',
      };
    }
  },

  /**
   * Update user address
   */
  async updateAddress(
    client: ApiClient,
    addressId: string,
    address: Partial<UserAddress>
  ): Promise<ApiResponse<UserAddress>> {
    try {
      return await client.put<UserAddress>(`/api/user/addresses/${addressId}`, address);
    } catch (error) {
      console.error('Error updating user address:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update address',
      };
    }
  },

  /**
   * Delete user address
   */
  async deleteAddress(
    client: ApiClient,
    addressId: string
  ): Promise<ApiResponse<void>> {
    try {
      return await client.delete<void>(`/api/user/addresses/${addressId}`);
    } catch (error) {
      console.error('Error deleting user address:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete address',
      };
    }
  },

  /**
   * Update user preferences
   */
  async updatePreferences(
    client: ApiClient,
    preferences: Partial<UserPreferences>
  ): Promise<ApiResponse<UserPreferences>> {
    try {
      return await client.put<UserPreferences>('/api/user/preferences', preferences);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update preferences',
      };
    }
  },
};