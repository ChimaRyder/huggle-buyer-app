import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useApi } from './ApiContext';
import { API_ENDPOINTS } from '@/constants/config';
import { BackendProduct } from '@/types/BackendModels';

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
  
  // Store Products
  storeProducts: BackendProduct[];
  isFetchingProducts: boolean;
  productsError: string | null;
  fetchStoreProducts: (storeId: string) => Promise<void>;
  clearStoreProducts: () => void;
  
  // Store Following
  isFollowingStore: boolean;
  followerCount: number;
  isFetchingFollowStatus: boolean;
  followError: string | null;
  followStore: (storeId: string) => Promise<void>;
  unfollowStore: (storeId: string) => Promise<void>;
  fetchFollowStatus: (storeId: string) => Promise<void>;
  clearFollowStatus: () => void;
  
  // Followed Stores List
  followedStores: any[];
  isFetchingFollowedStores: boolean;
  followedStoresError: string | null;
  fetchFollowedStores: () => Promise<void>;
  clearFollowedStores: () => void;
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
  
  // Store Products state
  const [storeProducts, setStoreProducts] = useState<BackendProduct[]>([]);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  
  // Store Following state
  const [isFollowingStore, setIsFollowingStore] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFetchingFollowStatus, setIsFetchingFollowStatus] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);
  
  // Followed Stores List state
  const [followedStores, setFollowedStores] = useState<any[]>([]);
  const [isFetchingFollowedStores, setIsFetchingFollowedStores] = useState(false);
  const [followedStoresError, setFollowedStoresError] = useState<string | null>(null);
  
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
            createdAt: store.createdAt
          };
        } else {
          // Handle direct response
          const store = response.data;
          storeData = {
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
            createdAt: store.createdAt
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

  const fetchStoreProducts = useCallback(async (storeId: string): Promise<void> => {
    setIsFetchingProducts(true);
    setProductsError(null);
    
    try {
      console.log('🔍 StoreContext: Starting fetchStoreProducts for storeId:', storeId);
      const response = await client.get<any>(API_ENDPOINTS.products.byStore(storeId));
      console.log('🔍 StoreContext: Raw API response for store products:', response);

      if (response.success && response.data) {
        console.log('✅ StoreContext: Fetch store products response:', response.data);
        
        // Handle different response structures
        let productsArray: BackendProduct[] = [];
        if (response.data.data && response.data.data.items && Array.isArray(response.data.data.items)) {
          console.log('🔍 StoreContext: Found paginated products in items array');
          productsArray = response.data.data.items;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          console.log('🔍 StoreContext: Found nested products array');
          productsArray = response.data.data;
        } else if (Array.isArray(response.data)) {
          console.log('🔍 StoreContext: Found direct products array');
          productsArray = response.data;
        } else if (response.data.products && Array.isArray(response.data.products)) {
          console.log('🔍 StoreContext: Found products in products property');
          productsArray = response.data.products;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          console.log('🔍 StoreContext: Found products in items property');
          productsArray = response.data.items;
        }
        
        console.log('🔍 StoreContext: Processed products array:', productsArray.length, 'items');
        setStoreProducts(productsArray);
        console.log('✅ StoreContext: Set storeProducts to:', productsArray.length, 'items');
      } else {
        console.warn('❌ StoreContext: Failed to fetch store products - success:', response.success, 'error:', response.error);
        setProductsError(response.error || 'Failed to fetch store products');
        setStoreProducts([]);
      }
    } catch (error) {
      console.error('❌ StoreContext: Exception in fetchStoreProducts:', error);
      setProductsError(error instanceof Error ? error.message : 'Unknown error occurred');
      setStoreProducts([]);
    } finally {
      setIsFetchingProducts(false);
      console.log('🔍 StoreContext: fetchStoreProducts finished');
    }
  }, [client]);

  const clearStoreProducts = useCallback((): void => {
    setStoreProducts([]);
    setProductsError(null);
  }, []);

  const followStore = useCallback(async (storeId: string): Promise<void> => {
    setFollowError(null);
    
    try {
      console.log('🔍 StoreContext: Following store:', storeId);
      const response = await client.post<any>(API_ENDPOINTS.following.followStore(storeId), {});
      console.log('🔍 StoreContext: Follow store response:', response);

      if (response.success) {
        setIsFollowingStore(true);
        setFollowerCount(prev => prev + 1);
        console.log('✅ StoreContext: Successfully followed store');
      } else {
        console.warn('❌ StoreContext: Failed to follow store:', response.error);
        setFollowError(response.error || 'Failed to follow store');
      }
    } catch (error) {
      console.error('❌ StoreContext: Exception in followStore:', error);
      setFollowError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }, [client]);

  const unfollowStore = useCallback(async (storeId: string): Promise<void> => {
    setFollowError(null);
    
    try {
      console.log('🔍 StoreContext: Unfollowing store:', storeId);
      const response = await client.delete<any>(API_ENDPOINTS.following.unfollowStore(storeId));
      console.log('🔍 StoreContext: Unfollow store response:', response);

      if (response.success) {
        setIsFollowingStore(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
        console.log('✅ StoreContext: Successfully unfollowed store');
      } else {
        console.warn('❌ StoreContext: Failed to unfollow store:', response.error);
        setFollowError(response.error || 'Failed to unfollow store');
      }
    } catch (error) {
      console.error('❌ StoreContext: Exception in unfollowStore:', error);
      setFollowError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }, [client]);

  const fetchFollowStatus = useCallback(async (storeId: string): Promise<void> => {
    setIsFetchingFollowStatus(true);
    setFollowError(null);
    
    try {
      console.log('🔍 StoreContext: Fetching follow status for store:', storeId);
      const response = await client.get<any>(API_ENDPOINTS.following.getStoreFollowerInfo(storeId));
      console.log('🔍 StoreContext: Follow status response:', response);

      if (response.success && response.data) {
        const data = response.data.data || response.data;
        setIsFollowingStore(data.isFollowing || false);
        setFollowerCount(data.followerCount || 0);
        console.log('✅ StoreContext: Follow status updated:', { isFollowing: data.isFollowing, count: data.followerCount });
      } else {
        console.warn('❌ StoreContext: Failed to fetch follow status:', response.error);
        setFollowError(response.error || 'Failed to fetch follow status');
      }
    } catch (error) {
      console.error('❌ StoreContext: Exception in fetchFollowStatus:', error);
      setFollowError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsFetchingFollowStatus(false);
    }
  }, [client]);

  const clearFollowStatus = useCallback((): void => {
    setIsFollowingStore(false);
    setFollowerCount(0);
    setFollowError(null);
  }, []);

  const fetchFollowedStores = useCallback(async (): Promise<void> => {
    setIsFetchingFollowedStores(true);
    setFollowedStoresError(null);
    
    try {
      console.log('🔍 StoreContext: Fetching followed stores');
      const response = await client.get<any>(API_ENDPOINTS.following.getFollowedStores);
      console.log('🔍 StoreContext: Followed stores response:', response);

      if (response.success && response.data) {
        console.log('✅ StoreContext: Fetch followed stores response:', response.data);
        
        // Handle different response structures
        let storesArray: any[] = [];
        if (response.data.data && Array.isArray(response.data.data)) {
          console.log('🔍 StoreContext: Found nested followed stores array');
          storesArray = response.data.data;
        } else if (Array.isArray(response.data)) {
          console.log('🔍 StoreContext: Found direct followed stores array');
          storesArray = response.data;
        }
        
        console.log('🔍 StoreContext: Processed followed stores array:', storesArray.length, 'items');
        setFollowedStores(storesArray);
        console.log('✅ StoreContext: Set followedStores to:', storesArray.length, 'items');
      } else {
        console.warn('❌ StoreContext: Failed to fetch followed stores - success:', response.success, 'error:', response.error);
        setFollowedStoresError(response.error || 'Failed to fetch followed stores');
        setFollowedStores([]);
      }
    } catch (error) {
      console.error('❌ StoreContext: Exception in fetchFollowedStores:', error);
      setFollowedStoresError(error instanceof Error ? error.message : 'Unknown error occurred');
      setFollowedStores([]);
    } finally {
      setIsFetchingFollowedStores(false);
      console.log('🔍 StoreContext: fetchFollowedStores finished');
    }
  }, [client]);

  const clearFollowedStores = useCallback((): void => {
    setFollowedStores([]);
    setFollowedStoresError(null);
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
    
    // Store Products
    storeProducts,
    isFetchingProducts,
    productsError,
    fetchStoreProducts,
    clearStoreProducts,
    
    // Store Following
    isFollowingStore,
    followerCount,
    isFetchingFollowStatus,
    followError,
    followStore,
    unfollowStore,
    fetchFollowStatus,
    clearFollowStatus,
    
    // Followed Stores List
    followedStores,
    isFetchingFollowedStores,
    followedStoresError,
    fetchFollowedStores,
    clearFollowedStores,
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