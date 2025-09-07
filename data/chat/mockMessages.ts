/**
 * Mock chat messages and conversation data
 * Used for generating realistic chat conversations with stores
 */

import { restaurants } from '../food/mockData';
import { mockStores } from '../mockData';

export interface ChatConversation {
  id: string;
  storeId: string;
  storeName: string;
  storeImage: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

// Mock message templates for chat conversations
export const mockChatMessages = [
  "Your order is ready for pickup!",
  "Thank you for your order. We're preparing it now.",
  "We have a special offer on organic produce today!",
  "Your delivery will arrive in 30 minutes.",
  "Welcome! How can we help you today?",
  "Your payment has been processed successfully.",
  "We're running low on this item. Would you like a substitute?",
  "Don't forget about your items in the cart!",
  "New arrivals just came in! Check them out.",
  "Your favorite items are back in stock!",
];

// Generate mock chat conversations based on restaurants and stores
export const generateMockChats = (): ChatConversation[] => {
  // Combine restaurants from food data and grocery stores from main mock data
  const allStores = [
    ...restaurants.slice(0, 4).map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      image: restaurant.image,
      type: 'restaurant'
    })),
    ...mockStores.filter(store => store.storeCategory?.includes('Grocery') || store.storeCategory?.includes('Organic')).slice(0, 3).map(store => ({
      id: store.id,
      name: store.name,
      image: store.storeImageUrl,
      type: 'grocery'
    }))
  ];

  return allStores.map((store, index) => ({
    id: `chat-${store.id}`,
    storeId: store.id,
    storeName: store.name,
    storeImage: store.image,
    lastMessage: mockChatMessages[index % mockChatMessages.length] || "Welcome! How can we help you today?",
    lastMessageTime: index === 0 ? "2m ago" : index === 1 ? "1h ago" : index === 2 ? "3h ago" : index === 3 ? "1d ago" : "2d ago",
    unreadCount: index < 3 ? Math.floor(Math.random() * 4) + 1 : 0,
    isOnline: index < 4,
  }));
};