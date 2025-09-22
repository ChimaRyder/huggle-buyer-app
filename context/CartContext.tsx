import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartItem } from '../data/food/models';

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'UPDATE_QUANTITY'; id: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_SPECIAL_INSTRUCTIONS'; id: string; instructions: string }
  | { type: 'TOGGLE_ITEM_SELECTION'; id: string }
  | { type: 'SELECT_ALL_ITEMS'; selected: boolean };

interface CartContextType {
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setSpecialInstructions: (id: string, instructions: string) => void;
  clearCart: () => void;
  itemCount: number;
  selectedItems: CartItem[];
  selectedTotal: number;
  toggleItemSelection: (id: string) => void;
  selectAllItems: (selected: boolean) => void;
  hasExpiredItems: boolean;
  activeItems: CartItem[];
  expiredItems: CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartState {
  items: CartItem[];
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
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
    
    case 'SET_SPECIAL_INSTRUCTIONS':
      return {
        items: state.items.map(item =>
          item.id === action.id
            ? { ...item, specialInstructions: action.instructions }
            : item
        ),
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
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  
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
  
  const itemCount = state.items.reduce(
    (count, item) => count + item.quantity,
    0
  );
  
  // Selected items calculations
  const selectedItems = state.items.filter(item => item.selected);
  const selectedTotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  const hasExpiredItems = expiredItems.length > 0;
  
  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', item });
  };
  
  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', id });
  };
  
  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', id, quantity });
  };
  
  const setSpecialInstructions = (id: string, instructions: string) => {
    dispatch({ type: 'SET_SPECIAL_INSTRUCTIONS', id, instructions });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  
  const toggleItemSelection = (id: string) => {
    dispatch({ type: 'TOGGLE_ITEM_SELECTION', id });
  };
  
  const selectAllItems = (selected: boolean) => {
    dispatch({ type: 'SELECT_ALL_ITEMS', selected });
  };
  
  return (
    <CartContext.Provider
      value={{
        items: state.items,
        total,
        addItem,
        removeItem,
        updateQuantity,
        setSpecialInstructions,
        clearCart,
        itemCount,
        selectedItems,
        selectedTotal,
        toggleItemSelection,
        selectAllItems,
        hasExpiredItems,
        activeItems,
        expiredItems,
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