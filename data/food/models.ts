export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
  specialInstructions?: string;
  storeId: string;
  storeName: string;
  category?: string;
  isActive?: boolean;
  expiresAt?: string;
  selected?: boolean; // For checkout selection
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  storeId: string;
  storeName: string;
  category: string;
  isActive: boolean;
  expiresAt?: string;
  inventory?: number;
}

export interface Store {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  isOpen: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
  image: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  storeId: string;
  storeName: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveryAddress: string;
  estimatedDeliveryTime: string;
}