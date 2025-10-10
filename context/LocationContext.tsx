import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@clerk/clerk-expo';
import { useApi } from './ApiContext';
import { API_ENDPOINTS } from '@/constants/config';
import * as ExpoLocation from 'expo-location';
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
  setLocation: (location: Location | SavedLocation) => Promise<void>;
  saveLocation: (location: Location, label: string) => Promise<void>;
  deleteSavedLocation: (locationId: string) => Promise<void>;
  fetchAllLocations: () => Promise<void>;
  getLocationAddress: (location: Location) => Promise<string>;
  initializeLocationInBackground: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const CURRENT_LOCATION_KEY = 'currentLocation';
const ADDRESS_CACHE_KEY = 'addressCache';
const LOCATION_INITIALIZED_KEY = 'locationInitialized';

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [currentLocation, setCurrentLocation] = useState<Location | SavedLocation | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [addressCache, setAddressCache] = useState<Record<string, string>>({});
  
  const { client } = useApi();
  const { userId } = useAuth();

  // Helper function to create cache key for coordinates
  const getCacheKey = (location: Location): string => {
    return `${location.latitude.toFixed(4)}_${location.longitude.toFixed(4)}`;
  };

  // Load cached addresses from storage
  const loadAddressCache = async () => {
    try {
      const cached = await AsyncStorage.getItem(ADDRESS_CACHE_KEY);
      if (cached) {
        setAddressCache(JSON.parse(cached));
      }
    } catch (error) {
      console.error('Error loading address cache:', error);
    }
  };

  // Save address to cache
  const saveAddressToCache = async (location: Location, address: string) => {
    try {
      const key = getCacheKey(location);
      const newCache = { ...addressCache, [key]: address };
      setAddressCache(newCache);
      await AsyncStorage.setItem(ADDRESS_CACHE_KEY, JSON.stringify(newCache));
    } catch (error) {
      console.error('Error saving address to cache:', error);
    }
  };

  // Load current location and address cache from AsyncStorage on mount
  useEffect(() => {
    loadCurrentLocationFromStorage();
    loadAddressCache();
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

  const setLocation = async (location: Location | SavedLocation): Promise<void> => {
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
        // Set current location to the saved location (with label)
        await setLocation(savedLocationData);
        
        // Try to refresh the saved locations list, but don't fail if it doesn't work
        try {
          await fetchAllLocations();
        } catch (error) {
          console.warn('⚠️ LocationContext: Could not refresh locations after save, but save was successful:', error);
        }
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

  // Get location address with caching
  const getLocationAddress = async (location: Location): Promise<string> => {
    try {
      // Check if location is a saved location with a label
      if ('label' in location && location.label) {
        return location.label;
      }

      // Check address cache first
      const cacheKey = getCacheKey(location);
      if (addressCache[cacheKey]) {
        return addressCache[cacheKey];
      }

      // If location has an address property, use it
      if (location.address) {
        await saveAddressToCache(location, location.address);
        return location.address;
      }

      // Reverse geocode to get address
      const addresses = await ExpoLocation.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (addresses.length > 0) {
        const addr = addresses[0];
        const locationParts = [];
        
        // Priority 1: Street or name (most specific)
        if (addr.street) {
          locationParts.push(addr.street);
        } else if (addr.name) {
          locationParts.push(addr.name);
        }
        
        // Priority 2: District or subregion (neighborhood level)
        if (addr.district) {
          locationParts.push(addr.district);
        } else if (addr.subregion) {
          locationParts.push(addr.subregion);
        }
        
        // Priority 3: City (always try to include)
        if (addr.city) {
          locationParts.push(addr.city);
        }
        
        const addressString = locationParts.length > 0 
          ? locationParts.join(", ")
          : `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
        
        // Cache the result
        await saveAddressToCache(location, addressString);
        return addressString;
      }

      // Fallback to coordinates
      const coordsString = `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
      await saveAddressToCache(location, coordsString);
      return coordsString;
    } catch (error) {
      console.error('Error getting location address:', error);
      return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
    }
  };

  // Initialize location in background for faster app startup
  const initializeLocationInBackground = async (): Promise<void> => {
    try {
      // Check if we've already initialized recently
      const lastInitialized = await AsyncStorage.getItem(LOCATION_INITIALIZED_KEY);
      const now = Date.now();
      
      // Only initialize once every 2 minutes (reduced from 10 minutes)
      // But always initialize if we don't have a current location
      if (currentLocation && lastInitialized && (now - parseInt(lastInitialized)) < 2 * 60 * 1000) {
        console.log('⏸️ LocationContext: Skipping background initialization - recently done and have location');
        return;
      }

      // Check if location permission is granted
      const { status } = await ExpoLocation.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      // If we don't have a current location, try to get one
      if (!currentLocation) {
        const position = await ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.Balanced,
          maximumAge: 300000, // 5 minutes
          timeout: 10000,
        });

        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // Get and cache the address
        const address = await getLocationAddress(location);
        const locationWithAddress = { ...location, address };

        // Save to storage and update state using setLocation helper
        await setLocation(locationWithAddress);
        console.log('✅ LocationContext: Background initialization saved location to context');

        // Mark as initialized
        await AsyncStorage.setItem(LOCATION_INITIALIZED_KEY, now.toString());
      }
    } catch (error) {
      console.error('Error initializing location in background:', error);
      // Don't throw - this is a background operation
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
    getLocationAddress,
    initializeLocationInBackground,
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