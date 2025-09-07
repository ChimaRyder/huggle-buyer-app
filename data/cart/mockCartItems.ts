/**
 * Mock cart items for demo purposes
 * Used to populate the cart with sample data
 */

import { foodItems } from '../food/mockData';

export interface MockCartItem {
  id: string;
  foodId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  specialInstructions?: string;
}

// Sample cart items using existing food items data
export const mockCartItems: MockCartItem[] = [
  {
    id: 'cart-1',
    foodId: foodItems[0].id,
    name: foodItems[0].name,
    description: foodItems[0].description,
    price: foodItems[0].price,
    quantity: 2,
    image: foodItems[0].image,
    specialInstructions: 'Please pack separately'
  },
  {
    id: 'cart-2',
    foodId: foodItems[4].id,
    name: foodItems[4].name,
    description: foodItems[4].description,
    price: foodItems[4].price,
    quantity: 1,
    image: foodItems[4].image,
    specialInstructions: 'Ripe but not too soft'
  },
  {
    id: 'cart-3',
    foodId: foodItems[6].id,
    name: foodItems[6].name,
    description: foodItems[6].description,
    price: foodItems[6].price,
    quantity: 3,
    image: foodItems[6].image
  }
];