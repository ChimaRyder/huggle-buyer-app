/**
 * Location Service
 * Handles location-related API operations
 */

import type { ApiClient } from '@/contexts/ApiContext';
import type { ApiResponse, PaginationParams } from '@/types/common';

// Location types - you can extend these based on your needs
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface Store {
  id: string;
  name: string;
  location: Location;
  distance?: number; // in meters
}

export const locationService = {
  /**
   * Get current user location (you'll implement this with expo-location)
   */
  async getCurrentLocation(): Promise<Location> {
    // This would integrate with expo-location
    // For now, returning a placeholder
    throw new Error('getCurrentLocation not implemented yet');
  },

  /**
   * Find nearby stores based on location
   */
  async findNearbyStores(
    client: ApiClient,
    location: Location,
    radiusInMeters: number = 5000,
    pagination?: PaginationParams
  ): Promise<ApiResponse<Store[]>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('lat', location.latitude.toString());
      queryParams.append('lng', location.longitude.toString());
      queryParams.append('radius', radiusInMeters.toString());
      
      if (pagination?.page) {
        queryParams.append('page', pagination.page.toString());
      }
      if (pagination?.limit) {
        queryParams.append('limit', pagination.limit.toString());
      }

      const endpoint = `/api/stores/nearby?${queryParams.toString()}`;
      return await client.get<Store[]>(endpoint);
    } catch (error) {
      console.error('Error finding nearby stores:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find nearby stores',
      };
    }
  },

  /**
   * Geocode an address to coordinates
   */
  async geocodeAddress(
    client: ApiClient,
    address: string
  ): Promise<ApiResponse<Location>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('address', address);

      const endpoint = `/api/location/geocode?${queryParams.toString()}`;
      return await client.get<Location>(endpoint);
    } catch (error) {
      console.error('Error geocoding address:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to geocode address',
      };
    }
  },

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(
    client: ApiClient,
    location: Location
  ): Promise<ApiResponse<Location>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('lat', location.latitude.toString());
      queryParams.append('lng', location.longitude.toString());

      const endpoint = `/api/location/reverse-geocode?${queryParams.toString()}`;
      return await client.get<Location>(endpoint);
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reverse geocode',
      };
    }
  },

  /**
   * Calculate distance between two locations
   */
  calculateDistance(location1: Location, location2: Location): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = location1.latitude * Math.PI/180;
    const φ2 = location2.latitude * Math.PI/180;
    const Δφ = (location2.latitude-location1.latitude) * Math.PI/180;
    const Δλ = (location2.longitude-location1.longitude) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  },
};