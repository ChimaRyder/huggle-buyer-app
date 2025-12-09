import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CartItem } from '../data/food/models';
import * as cartApi from '../utils/cart';
import { fetchStoreById } from '../utils/stores';
import { useAuth } from '@clerk/clerk-expo';

type CartAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_CART'; items: CartItem[] }
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'UPDATE_QUANTITY'; id: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_ITEM_SELECTION'; id: string }
  | { type: 'SELECT_ALL_ITEMS'; selected: boolean };

interface CartContextType {
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
  selectedItems: CartItem[];
  selectedTotal: number;
  toggleItemSelection: (id: string) => void; // Client-side only
  selectAllItems: (selected: boolean) => void; // Client-side only
  hasExpiredItems: boolean;
  activeItems: CartItem[];
  expiredItems: CartItem[];
  isLoading: boolean;
  error: string | null;
  refreshCart: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.loading,
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        isLoading: false,
      };
      
    case 'SET_CART':
      return {
        ...state,
        items: action.items,
        isLoading: false,
        error: null,
      };
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.item.id);
      
      if (existingItem) {
        return {
          items: state.items.map(item =>
            item.id === action.item.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      
      return {
        items: [...state.items, { ...action.item, selected: true }],
      };
    }
    
    case 'REMOVE_ITEM':
      return {
        items: state.items.filter(item => item.id !== action.id),
      };
    
    case 'UPDATE_QUANTITY':
      return {
        items: state.items.map(item =>
          item.id === action.id
            ? { ...item, quantity: action.quantity > 0 ? action.quantity : 0 }
            : item
        ).filter(item => item.quantity > 0),
      };
    
    
    case 'CLEAR_CART':
      return {
        items: [],
      };
    
    case 'TOGGLE_ITEM_SELECTION':
      return {
        items: state.items.map(item =>
          item.id === action.id
            ? { ...item, selected: !item.selected }
            : item
        ),
      };
    
    case 'SELECT_ALL_ITEMS':
      return {
        items: state.items.map(item => ({ ...item, selected: action.selected })),
      };
    
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { 
    items: [], 
    isLoading: false, 
    error: null 
  });
  const { getToken } = useAuth();
  
  // Separate active and expired items
  const now = new Date();
  const activeItems = state.items.filter(item => {
    if (!item.expiresAt) return item.isActive !== false;
    return item.isActive !== false && new Date(item.expiresAt) > now;
  });
  
  const expiredItems = state.items.filter(item => {
    if (!item.expiresAt) return item.isActive === false;
    return item.isActive === false || new Date(item.expiresAt) <= now;
  });
  
  const total = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  const itemCount = state.items.length;
  
  // Selected items calculations
  const selectedItems = state.items.filter(item => item.selected);
  const selectedTotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  const hasExpiredItems = expiredItems.length > 0;
  
  // Backend API integration methods
  const refreshCart = async () => {
    try {
      console.log('🔄 CartContext: Starting refreshCart');
      dispatch({ type: 'SET_LOADING', loading: true });
      const token = await getToken();
      
      // Check if token exists
      if (!token) {
        console.log('⚠️ CartContext: No auth token available, skipping cart refresh');
        dispatch({ type: 'SET_CART', items: [] });
        return;
      }
      
      console.log('🔑 CartContext: Got token for refresh', {
        hasToken: !!token,
        tokenLength: token?.length || 0
      });
      
      console.log('📡 CartContext: Calling API getCart');
      const response = await cartApi.getCart(token);
      
      console.log('📝 CartContext: getCart API response', {
        success: response?.success,
        hasData: !!response?.data,
        dataKeys: response?.data ? Object.keys(response.data) : [],
        itemsCount: response?.data?.items?.length || 0,
        fullResponse: response
      });
      
      if (response.success && response.data) {
        console.log('📦 CartContext: Raw cart items received:', response.data.items);
        
        const cartItems = await Promise.all(response.data.items.map(async (item: any) => {
          console.log('📦 CartContext: Processing cart item', {
            backendId: item.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            isActive: item.isActive,
            expiresAt: item.expiresAt,
            isSelected: item.isSelected,
            // Store-related fields
            storeId: item.storeId,
            storeName: item.storeName,
            storeProfileImage: item.storeProfileImage,
            storeImageUrl: item.storeImageUrl,
            storeImage: item.storeImage,
            // Show all available keys to see what the backend actually provides
            allBackendKeys: Object.keys(item)
          });
          
          let enrichedStoreName = item.storeName;
          let enrichedStoreProfileImage = item.storeProfileImage || item.storeImageUrl;
          
          // If store details are missing but we have a storeId, fetch them
          if (item.storeId && (!item.storeName || item.storeName.trim() === '')) {
            try {
              console.log('🔄 CartContext: Fetching store details for missing store data:', item.storeId);
              const storeData = await fetchStoreById(item.storeId, token);
              
              if (storeData.success && storeData.data) {
                enrichedStoreName = storeData.data.name || storeData.data.storeName || item.storeName;
                enrichedStoreProfileImage = storeData.data.profileImageUrl || storeData.data.imageUrl || storeData.data.image || enrichedStoreProfileImage;
                
                console.log('✅ CartContext: Enriched store data:', {
                  storeId: item.storeId,
                  originalStoreName: item.storeName,
                  enrichedStoreName,
                  originalStoreImage: item.storeProfileImage,
                  enrichedStoreImage: enrichedStoreProfileImage,
                  storeDataKeys: Object.keys(storeData.data)
                });
              }
            } catch (error) {
              console.log('⚠️ CartContext: Failed to fetch store details for', item.storeId, error);
              // Keep original values on error
            }
          }
          
          const mappedItem = {
            id: item.id, // This should now be the correct product ID from backend
            name: item.productName,
            description: item.productDescription,
            price: item.unitPrice,
            image: item.productImage,
            quantity: item.quantity,
            storeId: item.storeId,
            storeName: enrichedStoreName,
            storeProfileImage: enrichedStoreProfileImage,
            category: item.category,
            isActive: item.isActive,
            expiresAt: item.expiresAt,
            selected: item.isSelected
          };
          
          console.log('✅ CartContext: Final mapped cart item', {
            frontendId: mappedItem.id,
            name: mappedItem.name,
            // Store mapping results
            mappedStoreId: mappedItem.storeId,
            mappedStoreName: mappedItem.storeName,
            mappedStoreProfileImage: mappedItem.storeProfileImage,
            hasStoreProfileImageAfterMapping: !!mappedItem.storeProfileImage,
            wasEnriched: enrichedStoreName !== item.storeName || enrichedStoreProfileImage !== (item.storeProfileImage || item.storeImageUrl)
          });
          
          return mappedItem;
        }));
        
        console.log('✅ CartContext: Setting cart items', {
          itemCount: cartItems.length,
          itemSummary: cartItems.map(item => ({ id: item.id, name: item.name, quantity: item.quantity }))
        });
        
        dispatch({ type: 'SET_CART', items: cartItems });
      } else {
        console.log('⚠️ CartContext: No cart data in response or response not successful');
        dispatch({ type: 'SET_CART', items: [] });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh cart';
      console.error('❌ CartContext: refreshCart failed', {
        error: errorMessage,
        errorStack: error instanceof Error ? error.stack : undefined
      });
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      dispatch({ type: 'SET_CART', items: [] }); // Clear cart on error
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  };
  
  const addItem = async (item: CartItem) => {
    try {
      console.log('🛒 CartContext: Starting addItem process', {
        itemId: item.id,
        itemName: item.name,
        quantity: item.quantity,
        storeId: item.storeId,
        storeName: item.storeName
      });
      
      dispatch({ type: 'SET_LOADING', loading: true });
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication required to add items to cart');
      }
      
      console.log('🔑 CartContext: Got auth token', {
        hasToken: !!token,
        tokenLength: token?.length || 0
      });
      
      console.log('📡 CartContext: Calling API addToCart with:', {
        productId: item.id,
        quantity: item.quantity,
        tokenPreview: token ? token.substring(0, 10) + '...' : 'NO_TOKEN'
      });
      
      const addResult = await cartApi.addToCart(item.id, item.quantity, token);
      
      console.log('✅ CartContext: API addToCart success', {
        result: addResult
      });
      
      console.log('🔄 CartContext: Refreshing cart after add...');
      await refreshCart();
      
      console.log('✅ CartContext: Cart refreshed successfully after add');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item';
      console.error('❌ CartContext: addItem failed', {
        error: errorMessage,
        errorStack: error instanceof Error ? error.stack : undefined,
        itemId: item.id,
        itemName: item.name
      });
      dispatch({ type: 'SET_ERROR', error: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  };
  
  const removeItem = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication required to remove items from cart');
      }
      
      await cartApi.removeFromCart(id, token);
      await refreshCart();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: error instanceof Error ? error.message : 'Failed to remove item' });
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  };
  
  const updateQuantity = async (id: string, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication required to update cart');
      }
      
      await cartApi.updateCartItem(id, quantity, token);
      await refreshCart();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: error instanceof Error ? error.message : 'Failed to update quantity' });
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  };
  
  
  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication required to clear cart');
      }
      
      await cartApi.clearCart(token);
      dispatch({ type: 'SET_CART', items: [] });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: error instanceof Error ? error.message : 'Failed to clear cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  };
  
  const toggleItemSelection = (id: string) => {
    dispatch({ type: 'TOGGLE_ITEM_SELECTION', id });
  };
  
  const selectAllItems = (selected: boolean) => {
    dispatch({ type: 'SELECT_ALL_ITEMS', selected });
  };
  
  
  
  // Load cart only when user is authenticated
  useEffect(() => {
    let isMounted = true;
    let hasLoaded = false;
    
    const loadCart = async () => {
      // Prevent multiple loads
      if (hasLoaded) return;
      
      try {
        const token = await getToken();
        if (token && isMounted) {
          hasLoaded = true;
          console.log('🛒 CartContext: User authenticated, loading cart');
          await refreshCart();
        } else {
          console.log('⏭️ CartContext: User not authenticated, skipping cart load');
        }
      } catch (error) {
        console.error('❌ CartContext: Error checking authentication:', error);
      }
    };

    // Small delay to ensure authentication is fully initialized
    const timer = setTimeout(loadCart, 300);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []); // Empty dependency array - only run once on mount
  
  // Helper to force refresh (for testing)
  const forceRefresh = async () => {
    console.log('🔄 CartContext: Force refreshing cart data...');
    await refreshCart();
  };
  
  return (
    <CartContext.Provider
      value={{
        items: state.items,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        selectedItems,
        selectedTotal,
        toggleItemSelection,
        selectAllItems,
        hasExpiredItems,
        activeItems,
        expiredItems,
        isLoading: state.isLoading,
        error: state.error,
        refreshCart,
        forceRefresh,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}