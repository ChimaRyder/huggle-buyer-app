export interface FoodCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string;
  distance: string;
  image: string;
  categories: string[];
  isFavorite: boolean;
  promotion?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isPopular: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  rating?: number;
}

export interface CartItem {
  id: string;
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  total: number;
  status: 'preparing' | 'ready' | 'picked_up' | 'completed';
  orderTime: string;
  pickupTime: string;
  orderNumber: string;
}