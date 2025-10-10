/**
 * App State Context
 * Global state management using Context + useReducer pattern
 * Manages cart, favorites, user preferences, and loading states
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';

import type { BackendProduct, BackendCartItem } from '@/types/BackendModels';
import type { LoadingState } from '@/types/common';

// State interface
interface AppState {
  cart: {
    items: BackendCartItem[];
    loading: boolean;
    error: string | null;
  };
  favorites: {
    productIds: string[];
    loading: boolean;
    error: string | null;
  };
  products: {
    items: BackendProduct[];
    loading: boolean;
    error: string | null;
    filters: {
      category?: string;
      priceRange?: { min: number; max: number };
      searchQuery?: string;
    };
  };
  user: {
    location: {
      latitude?: number;
      longitude?: number;
      address?: string;
    } | null;
    preferences: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
  };
  ui: {
    isOnboarded: boolean;
    activeModal: string | null;
    networkStatus: 'online' | 'offline' | 'unknown';
  };
}

// Action types
type AppAction =
  | { type: 'CART_LOADING'; payload: boolean }
  | { type: 'CART_SET_ITEMS'; payload: BackendCartItem[] }
  | { type: 'CART_ADD_ITEM'; payload: BackendCartItem }
  | { type: 'CART_UPDATE_ITEM'; payload: { id: string; quantity: number } }
  | { type: 'CART_REMOVE_ITEM'; payload: string }
  | { type: 'CART_SET_ERROR'; payload: string | null }
  | { type: 'FAVORITES_LOADING'; payload: boolean }
  | { type: 'FAVORITES_SET_ITEMS'; payload: string[] }
  | { type: 'FAVORITES_ADD_ITEM'; payload: string }
  | { type: 'FAVORITES_REMOVE_ITEM'; payload: string }
  | { type: 'FAVORITES_SET_ERROR'; payload: string | null }
  | { type: 'PRODUCTS_LOADING'; payload: boolean }
  | { type: 'PRODUCTS_SET_ITEMS'; payload: BackendProduct[] }
  | { type: 'PRODUCTS_SET_FILTERS'; payload: Partial<AppState['products']['filters']> }
  | { type: 'PRODUCTS_SET_ERROR'; payload: string | null }
  | { type: 'USER_SET_LOCATION'; payload: AppState['user']['location'] }
  | { type: 'USER_SET_PREFERENCES'; payload: Partial<AppState['user']['preferences']> }
  | { type: 'UI_SET_ONBOARDED'; payload: boolean }
  | { type: 'UI_SET_MODAL'; payload: string | null }
  | { type: 'UI_SET_NETWORK_STATUS'; payload: AppState['ui']['networkStatus'] };

// Initial state
const initialState: AppState = {
  cart: {
    items: [],
    loading: false,
    error: null,
  },
  favorites: {
    productIds: [],
    loading: false,
    error: null,
  },
  products: {
    items: [],
    loading: false,
    error: null,
    filters: {},
  },
  user: {
    location: null,
    preferences: {
      theme: 'light',
      notifications: true,
    },
  },
  ui: {
    isOnboarded: false,
    activeModal: null,
    networkStatus: 'unknown',
  },
};

// Reducer function
const appStateReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    // Cart actions
    case 'CART_LOADING':
      return {
        ...state,
        cart: { ...state.cart, loading: action.payload },
      };

    case 'CART_SET_ITEMS':
      return {
        ...state,
        cart: { ...state.cart, items: action.payload, loading: false, error: null },
      };

    case 'CART_ADD_ITEM':
      return {
        ...state,
        cart: {
          ...state.cart,
          items: [...state.cart.items, action.payload],
          error: null,
        },
      };

    case 'CART_UPDATE_ITEM':
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: action.payload.quantity }
              : item
          ),
          error: null,
        },
      };

    case 'CART_REMOVE_ITEM':
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.filter((item) => item.id !== action.payload),
          error: null,
        },
      };

    case 'CART_SET_ERROR':
      return {
        ...state,
        cart: { ...state.cart, error: action.payload, loading: false },
      };

    // Favorites actions
    case 'FAVORITES_LOADING':
      return {
        ...state,
        favorites: { ...state.favorites, loading: action.payload },
      };

    case 'FAVORITES_SET_ITEMS':
      return {
        ...state,
        favorites: { ...state.favorites, productIds: action.payload, loading: false, error: null },
      };

    case 'FAVORITES_ADD_ITEM':
      return {
        ...state,
        favorites: {
          ...state.favorites,
          productIds: [...state.favorites.productIds, action.payload],
          error: null,
        },
      };

    case 'FAVORITES_REMOVE_ITEM':
      return {
        ...state,
        favorites: {
          ...state.favorites,
          productIds: state.favorites.productIds.filter((id) => id !== action.payload),
          error: null,
        },
      };

    case 'FAVORITES_SET_ERROR':
      return {
        ...state,
        favorites: { ...state.favorites, error: action.payload, loading: false },
      };

    // Products actions
    case 'PRODUCTS_LOADING':
      return {
        ...state,
        products: { ...state.products, loading: action.payload },
      };

    case 'PRODUCTS_SET_ITEMS':
      return {
        ...state,
        products: { ...state.products, items: action.payload, loading: false, error: null },
      };

    case 'PRODUCTS_SET_FILTERS':
      return {
        ...state,
        products: {
          ...state.products,
          filters: { ...state.products.filters, ...action.payload },
        },
      };

    case 'PRODUCTS_SET_ERROR':
      return {
        ...state,
        products: { ...state.products, error: action.payload, loading: false },
      };

    // User actions
    case 'USER_SET_LOCATION':
      return {
        ...state,
        user: { ...state.user, location: action.payload },
      };

    case 'USER_SET_PREFERENCES':
      return {
        ...state,
        user: {
          ...state.user,
          preferences: { ...state.user.preferences, ...action.payload },
        },
      };

    // UI actions
    case 'UI_SET_ONBOARDED':
      return {
        ...state,
        ui: { ...state.ui, isOnboarded: action.payload },
      };

    case 'UI_SET_MODAL':
      return {
        ...state,
        ui: { ...state.ui, activeModal: action.payload },
      };

    case 'UI_SET_NETWORK_STATUS':
      return {
        ...state,
        ui: { ...state.ui, networkStatus: action.payload },
      };

    default:
      return state;
  }
};

// Context interface
interface AppStateContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper action creators
  actions: {
    cart: {
      setLoading: (loading: boolean) => void;
      setItems: (items: BackendCartItem[]) => void;
      addItem: (item: BackendCartItem) => void;
      updateItem: (id: string, quantity: number) => void;
      removeItem: (id: string) => void;
      setError: (error: string | null) => void;
    };
    favorites: {
      setLoading: (loading: boolean) => void;
      setItems: (productIds: string[]) => void;
      addItem: (productId: string) => void;
      removeItem: (productId: string) => void;
      setError: (error: string | null) => void;
    };
    products: {
      setLoading: (loading: boolean) => void;
      setItems: (products: BackendProduct[]) => void;
      setFilters: (filters: Partial<AppState['products']['filters']>) => void;
      setError: (error: string | null) => void;
    };
    user: {
      setLocation: (location: AppState['user']['location']) => void;
      setPreferences: (preferences: Partial<AppState['user']['preferences']>) => void;
    };
    ui: {
      setOnboarded: (onboarded: boolean) => void;
      setModal: (modal: string | null) => void;
      setNetworkStatus: (status: AppState['ui']['networkStatus']) => void;
    };
  };
}

// Create context
const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// Provider component
interface AppStateProviderProps {
  children: React.ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appStateReducer, initialState);

  // Action creators
  const actions = {
    cart: {
      setLoading: useCallback((loading: boolean) => 
        dispatch({ type: 'CART_LOADING', payload: loading }), []),
      setItems: useCallback((items: BackendCartItem[]) => 
        dispatch({ type: 'CART_SET_ITEMS', payload: items }), []),
      addItem: useCallback((item: BackendCartItem) => 
        dispatch({ type: 'CART_ADD_ITEM', payload: item }), []),
      updateItem: useCallback((id: string, quantity: number) => 
        dispatch({ type: 'CART_UPDATE_ITEM', payload: { id, quantity } }), []),
      removeItem: useCallback((id: string) => 
        dispatch({ type: 'CART_REMOVE_ITEM', payload: id }), []),
      setError: useCallback((error: string | null) => 
        dispatch({ type: 'CART_SET_ERROR', payload: error }), []),
    },
    favorites: {
      setLoading: useCallback((loading: boolean) => 
        dispatch({ type: 'FAVORITES_LOADING', payload: loading }), []),
      setItems: useCallback((productIds: string[]) => 
        dispatch({ type: 'FAVORITES_SET_ITEMS', payload: productIds }), []),
      addItem: useCallback((productId: string) => 
        dispatch({ type: 'FAVORITES_ADD_ITEM', payload: productId }), []),
      removeItem: useCallback((productId: string) => 
        dispatch({ type: 'FAVORITES_REMOVE_ITEM', payload: productId }), []),
      setError: useCallback((error: string | null) => 
        dispatch({ type: 'FAVORITES_SET_ERROR', payload: error }), []),
    },
    products: {
      setLoading: useCallback((loading: boolean) => 
        dispatch({ type: 'PRODUCTS_LOADING', payload: loading }), []),
      setItems: useCallback((products: BackendProduct[]) => 
        dispatch({ type: 'PRODUCTS_SET_ITEMS', payload: products }), []),
      setFilters: useCallback((filters: Partial<AppState['products']['filters']>) => 
        dispatch({ type: 'PRODUCTS_SET_FILTERS', payload: filters }), []),
      setError: useCallback((error: string | null) => 
        dispatch({ type: 'PRODUCTS_SET_ERROR', payload: error }), []),
    },
    user: {
      setLocation: useCallback((location: AppState['user']['location']) => 
        dispatch({ type: 'USER_SET_LOCATION', payload: location }), []),
      setPreferences: useCallback((preferences: Partial<AppState['user']['preferences']>) => 
        dispatch({ type: 'USER_SET_PREFERENCES', payload: preferences }), []),
    },
    ui: {
      setOnboarded: useCallback((onboarded: boolean) => 
        dispatch({ type: 'UI_SET_ONBOARDED', payload: onboarded }), []),
      setModal: useCallback((modal: string | null) => 
        dispatch({ type: 'UI_SET_MODAL', payload: modal }), []),
      setNetworkStatus: useCallback((status: AppState['ui']['networkStatus']) => 
        dispatch({ type: 'UI_SET_NETWORK_STATUS', payload: status }), []),
    },
  };

  const value = {
    state,
    dispatch,
    actions,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

// Hook to use the app state
export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

// Selector hooks for specific parts of state
export const useCartState = () => {
  const { state, actions } = useAppState();
  return {
    ...state.cart,
    actions: actions.cart,
  };
};

export const useFavoritesState = () => {
  const { state, actions } = useAppState();
  return {
    ...state.favorites,
    actions: actions.favorites,
  };
};

export const useProductsState = () => {
  const { state, actions } = useAppState();
  return {
    ...state.products,
    actions: actions.products,
  };
};

export const useUserState = () => {
  const { state, actions } = useAppState();
  return {
    ...state.user,
    actions: actions.user,
  };
};

export const useUIState = () => {
  const { state, actions } = useAppState();
  return {
    ...state.ui,
    actions: actions.ui,
  };
};