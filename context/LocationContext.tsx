import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@clerk/clerk-expo';
import { useApi } from './ApiContext';
import { API_ENDPOINTS } from '@/constants/config';
import type { Location } from '@/types/common';

interface SavedLocation extends Location {
  id: string;
  label: string;
  createdAt: string;
}

interface LocationContextType {
  currentLocation: Location | null;
  savedLocations: SavedLocation[];
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  setLocation: (location: Location) => Promise<void>;
  saveLocation: (location: Location, label: string) => Promise<void>;
  deleteSavedLocation: (locationId: string) => Promise<void>;
  fetchAllLocations: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const CURRENT_LOCATION_KEY = 'currentLocation';

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { client } = useApi();
  const { userId } = useAuth();

  // Load current location from AsyncStorage on mount
  useEffect(() => {
    loadCurrentLocationFromStorage();
  }, []);

  const loadCurrentLocationFromStorage = async () => {
    try {
      console.log('🔍 LocationContext: Loading location from AsyncStorage...');
      const storedLocation = await AsyncStorage.getItem(CURRENT_LOCATION_KEY);
      console.log('🔍 LocationContext: Stored location from AsyncStorage:', storedLocation);
      
      if (storedLocation) {
        const parsed = JSON.parse(storedLocation);
        console.log('🔍 LocationContext: Parsed stored location:', parsed);
        setCurrentLocation(parsed);
        console.log('✅ LocationContext: Set currentLocation to:', parsed);
      } else {
        console.log('❌ LocationContext: No stored location found in AsyncStorage');
      }
    } catch (error) {
      console.error('❌ LocationContext: Error loading current location from storage:', error);
    }
  };

  const setLocation = async (location: Location): Promise<void> => {
    try {
      console.log('💾 LocationContext: setLocation - Saving location to AsyncStorage:', location);
      await AsyncStorage.setItem(CURRENT_LOCATION_KEY, JSON.stringify(location));
      console.log('✅ LocationContext: setLocation - Saved to AsyncStorage, updating state...');
      setCurrentLocation(location);
      console.log('✅ LocationContext: setLocation - State updated with:', location);
    } catch (error) {
      console.error('❌ LocationContext: setLocation - Error saving location to storage:', error);
      throw error;
    }
  };

  const saveLocation = async (location: Location, label: string): Promise<void> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    setIsSaving(true);
    try {
      const locationData = {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        label,
      };

      const response = await client.post<SavedLocation>(
        API_ENDPOINTS.locations.create,
        locationData
      );

      if (response.success && response.data) {
        console.log('✅ LocationContext: Save location response:', response.data);
        
        // Handle nested response structure for save (similar to fetch)
        let savedLocationData: SavedLocation;
        if (response.data.data) {
          // Response is nested: {data: {data: SavedLocation, success: true}, success: true}
          savedLocationData = response.data.data;
        } else {
          // Response is direct: {data: SavedLocation, success: true}
          savedLocationData = response.data;
        }
        
        console.log('🔍 LocationContext: Processed saved location:', savedLocationData);
        
        setSavedLocations(prev => {
          console.log('🔍 LocationContext: Current savedLocations state:', prev, 'Type:', typeof prev, 'Is Array:', Array.isArray(prev));
          const currentArray = Array.isArray(prev) ? prev : [];
          return [...currentArray, savedLocationData];
        });
        await setLocation(location);
      } else {
        throw new Error(response.error || 'Failed to save location');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSavedLocation = async (locationId: string): Promise<void> => {
    setIsDeleting(true);
    try {
      const response = await client.delete(API_ENDPOINTS.locations.delete(locationId));

      if (response.success) {
        setSavedLocations(prev => prev.filter(location => location.id !== locationId));
      } else {
        throw new Error(response.error || 'Failed to delete location');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchAllLocations = async (): Promise<void> => {
    if (!userId) {
      console.log('No user ID available, skipping location fetch');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔍 LocationContext: Starting fetchAllLocations for user:', userId);
      const response = await client.get<SavedLocation[]>(API_ENDPOINTS.locations.list);
      console.log('🔍 LocationContext: Raw API response:', response);

      if (response.success && response.data) {
        console.log('✅ LocationContext: Fetch locations response:', response.data, 'Type:', typeof response.data, 'Is Array:', Array.isArray(response.data));
        
        // Handle nested response structure: response.data.data
        let locationsArray: SavedLocation[] = [];
        if (Array.isArray(response.data)) {
          locationsArray = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          console.log('🔍 LocationContext: Found nested data structure, extracting locations');
          locationsArray = response.data.data;
        }
        
        console.log('🔍 LocationContext: Processed locations array:', locationsArray.length, 'items');
        setSavedLocations(locationsArray);
        console.log('✅ LocationContext: Set savedLocations to:', locationsArray.length, 'items');
      } else {
        console.warn('❌ LocationContext: Failed to fetch locations - success:', response.success, 'error:', response.error);
        setSavedLocations([]);
      }
    } catch (error) {
      console.error('❌ LocationContext: Exception in fetchAllLocations:', error);
      console.error('❌ LocationContext: Exception type:', typeof error);
      console.error('❌ LocationContext: Exception details:', error instanceof Error ? error.message : String(error));
      setSavedLocations([]);
      // Don't throw the error, just log it and continue
    } finally {
      setIsLoading(false);
      console.log('🔍 LocationContext: fetchAllLocations finished, isLoading set to false');
    }
  };

  const contextValue: LocationContextType = {
    currentLocation,
    savedLocations,
    isLoading,
    isSaving,
    isDeleting,
    setLocation,
    saveLocation,
    deleteSavedLocation,
    fetchAllLocations,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext(): LocationContextType {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}

export type { SavedLocation, LocationContextType };