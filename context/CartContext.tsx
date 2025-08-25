import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartItem } from '../data/food/models';

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'UPDATE_QUANTITY'; id: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_SPECIAL_INSTRUCTIONS'; id: string; instructions: string };

interface CartContextType {
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setSpecialInstructions: (id: string, instructions: string) => void;
  clearCart: () => void;
  itemCount: number;
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
        items: [...state.items, action.item],
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
    
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  
  const total = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  const itemCount = state.items.reduce(
    (count, item) => count + item.quantity,
    0
  );
  
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