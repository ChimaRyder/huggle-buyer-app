import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useApi } from './ApiContext';
import { API_ENDPOINTS } from '@/constants/config';

interface Store {
  id: string;
  sellerId: string;
  name: string;
  storeType: string;
  description: string;
  tags: string[];
  profileImageUrl: string;
  coverImageUrl: string;
  address: string;
  city: string;
  province: string;
  isOpen: boolean;
  isVerified: boolean;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  distance?: number;
  createdAt: string;
}

interface StoreContextType {
  // Popular Stores
  popularStores: Store[];
  isFetchingPopular: boolean;
  popularError: string | null;
  fetchPopularStores: (latitude?: number, longitude?: number, radius?: number) => Promise<void>;
  
  // Store by ID
  currentStore: Store | null;
  isFetchingStore: boolean;
  storeError: string | null;
  fetchStoreById: (id: string) => Promise<void>;
  clearCurrentStore: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  // Popular Stores state
  const [popularStores, setPopularStores] = useState<Store[]>([]);
  const [isFetchingPopular, setIsFetchingPopular] = useState(false);
  const [popularError, setPopularError] = useState<string | null>(null);
  
  // Store by ID state
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [isFetchingStore, setIsFetchingStore] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);
  
  const { client } = useApi();

  const fetchPopularStores = useCallback(async (latitude?: number, longitude?: number, radius: number = 5): Promise<void> => {
    setIsFetchingPopular(true);
    setPopularError(null);
    
    try {
      console.log('🔍 StoreContext: Starting fetchPopularStores with location:', { latitude, longitude, radius });
      
      // Use location-based endpoint if coordinates are provided
      if (latitude !== undefined && longitude !== undefined) {
        const endpoint = API_ENDPOINTS.stores.popular(latitude, longitude, radius, 10);
        console.log('🔍 StoreContext: Using popular stores endpoint:', endpoint);
        
        const response = await client.get<any>(endpoint);
        console.log('🔍 StoreContext: Raw API response:', response);

        if (response.success && response.data) {
          console.log('✅ StoreContext: Fetch popular stores response:', response.data);
          
          // Handle nested response structure
          let storesArray: Store[] = [];
          if (response.data.data && Array.isArray(response.data.data.stores)) {
            console.log('🔍 StoreContext: Found nested stores structure');
            storesArray = response.data.data.stores.map((store: any) => ({
              id: store.id,
              sellerId: store.sellerId,
              name: store.name,
              storeType: store.storeType,
              description: store.description,
              tags: store.tags || [],
              profileImageUrl: store.profileImageUrl,
              coverImageUrl: store.coverImageUrl,
              address: store.address,
              city: store.city,
              province: store.province,
              isOpen: store.isOpen,
              isVerified: store.isVerified,
              location: store.location ? {
                latitude: store.location.latitude,
                longitude: store.location.longitude
              } : null,
              distance: store.distance,
              createdAt: store.createdAt
            }));
          } else if (Array.isArray(response.data.stores)) {
            console.log('🔍 StoreContext: Found direct stores array');
            storesArray = response.data.stores.map((store: any) => ({
              id: store.id,
              sellerId: store.sellerId,
              name: store.name,
              storeType: store.storeType,
              description: store.description,
              tags: store.tags || [],
              profileImageUrl: Array.isArray(store.profileImageUrl) ? store.profileImageUrl[0] : store.profileImageUrl,
              coverImageUrl: Array.isArray(store.coverImageUrl) ? store.coverImageUrl[0] : store.coverImageUrl,
              address: store.address,
              city: store.city,
              province: store.province,
              isOpen: store.isOpen,
              isVerified: store.isVerified,
              location: store.location ? {
                latitude: store.location.latitude,
                longitude: store.location.longitude
              } : null,
              distance: store.distance,
              createdAt: store.createdAt
            }));
          }
          
          console.log('🔍 StoreContext: Processed stores array:', storesArray.length, 'items');
          setPopularStores(storesArray);
          console.log('✅ StoreContext: Set popularStores to:', storesArray.length, 'items');
        } else {
          console.warn('❌ StoreContext: Failed to fetch popular stores - success:', response.success, 'error:', response.error);
          setPopularError(response.error || 'Failed to fetch popular stores');
          setPopularStores([]);
        }
      } else {
        console.log('📍 StoreContext: No location provided, cannot fetch popular stores');
        setPopularError('Location required to fetch popular stores');
        setPopularStores([]);
      }
    } catch (error) {
      console.error('❌ StoreContext: Exception in fetchPopularStores:', error);
      setPopularError(error instanceof Error ? error.message : 'Unknown error occurred');
      setPopularStores([]);
    } finally {
      setIsFetchingPopular(false);
      console.log('🔍 StoreContext: fetchPopularStores finished');
    }
  }, [client]);

  const fetchStoreById = useCallback(async (id: string): Promise<void> => {
    setIsFetchingStore(true);
    setStoreError(null);
    
    try {
      console.log('🔍 StoreContext: Starting fetchStoreById for id:', id);
      const response = await client.get<any>(API_ENDPOINTS.stores.byId(id));
      console.log('🔍 StoreContext: Raw API response for store:', response);

      if (response.success && response.data) {
        console.log('✅ StoreContext: Fetch store by ID response:', response.data);
        
        // Handle nested response structure
        let storeData: Store;
        if (response.data.data && typeof response.data.data === 'object') {
          console.log('🔍 StoreContext: Found nested data structure, extracting store');
          const store = response.data.data;
          storeData = {
            id: store.Id,
            sellerId: store.SellerId,
            name: store.Name,
            storeType: store.StoreType,
            description: store.Description,
            tags: store.Tags || [],
            profileImageUrl: store.ProfileImageUrl,
            coverImageUrl: store.CoverImageUrl,
            address: store.Address,
            city: store.City,
            province: store.Province,
            isOpen: store.IsOpen,
            isVerified: store.IsVerified,
            location: store.Location ? {
              latitude: store.Location.Latitude,
              longitude: store.Location.Longitude
            } : null,
            createdAt: store.CreatedAt
          };
        } else {
          // Handle direct response
          const store = response.data;
          storeData = {
            id: store.Id,
            sellerId: store.SellerId,
            name: store.Name,
            storeType: store.StoreType,
            description: store.Description,
            tags: store.Tags || [],
            profileImageUrl: store.ProfileImageUrl,
            coverImageUrl: store.CoverImageUrl,
            address: store.Address,
            city: store.City,
            province: store.Province,
            isOpen: store.IsOpen,
            isVerified: store.IsVerified,
            location: store.Location ? {
              latitude: store.Location.Latitude,
              longitude: store.Location.Longitude
            } : null,
            createdAt: store.CreatedAt
          };
        }
        
        console.log('🔍 StoreContext: Processed store data:', storeData);
        setCurrentStore(storeData);
      } else {
        console.warn('❌ StoreContext: Failed to fetch store by ID - success:', response.success, 'error:', response.error);
        setStoreError(response.error || 'Failed to fetch store');
        setCurrentStore(null);
      }
    } catch (error) {
      console.error('❌ StoreContext: Exception in fetchStoreById:', error);
      setStoreError(error instanceof Error ? error.message : 'Unknown error occurred');
      setCurrentStore(null);
    } finally {
      setIsFetchingStore(false);
      console.log('🔍 StoreContext: fetchStoreById finished');
    }
  }, [client]);

  const clearCurrentStore = useCallback((): void => {
    setCurrentStore(null);
    setStoreError(null);
  }, []);

  const contextValue: StoreContextType = {
    // Popular Stores
    popularStores,
    isFetchingPopular,
    popularError,
    fetchPopularStores,
    
    // Store by ID
    currentStore,
    isFetchingStore,
    storeError,
    fetchStoreById,
    clearCurrentStore,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStoreContext(): StoreContextType {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  return context;
}

export type { Store, StoreContextType };