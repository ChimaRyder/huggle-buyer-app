/**
 * Mock Services Layer
 * This provides the same interface as real API services but returns mock data
 * Useful for development and testing before backend integration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { 
  BackendProduct, 
  BackendStore, 
  BackendReview, 
  BackendOrder, 
  BackendCartItem, 
  BackendBuyer,
  BackendNotification,
  CreateReviewRequest,
  AddToCartRequest,
  UpdateCartItemRequest,
  CreateOrderRequest,
  UpdateOrderRequest
} from '../types/BackendModels';
import { OrderStatus } from '../types/BackendModels';

import {
  mockProducts,
  mockStores,
  mockReviews,
  mockOrders,
  mockCartItems,
  mockBuyer,
  mockNotifications,
  mockCategories,
  mockPosts,
  mockConversations,
  getMockProductById,
  getMockStoreById,
  getMockReviewsByProductId,
  getMockOrdersByStatus,
  searchMockProducts,
  searchMockStores
} from './mockData';

// Simulate network delay
const simulateDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock API Response wrapper
const mockApiResponse = <T>(data: T, success = true, message = 'Success') => ({
  success,
  message,
  data,
  timestamp: new Date().toISOString()
});

export class MockProductService {
  static async getAllProducts(): Promise<BackendProduct[]> {
    await simulateDelay();
    return mockProducts;
  }

  static async getProductById(id: string): Promise<BackendProduct | null> {
    await simulateDelay();
    return getMockProductById(id) || null;
  }

  static async getProductsByStore(storeId: string): Promise<BackendProduct[]> {
    await simulateDelay();
    return mockProducts.filter(product => product.storeId === storeId);
  }

  static async searchProducts(query: string): Promise<BackendProduct[]> {
    await simulateDelay();
    return searchMockProducts(query);
  }

  static async getProductsByCategory(category: string): Promise<BackendProduct[]> {
    await simulateDelay();
    return mockProducts.filter(product => 
      product.category.some(cat => cat.toLowerCase() === category.toLowerCase())
    );
  }

  static async getFeaturedProducts(limit = 10): Promise<BackendProduct[]> {
    await simulateDelay();
    return mockProducts
      .filter(product => product.rating >= 4.5)
      .slice(0, limit);
  }
}

export class MockStoreService {
  static async getAllStores(): Promise<BackendStore[]> {
    await simulateDelay();
    return mockStores;
  }

  static async getStoreById(id: string): Promise<BackendStore | null> {
    await simulateDelay();
    return getMockStoreById(id) || null;
  }

  static async searchStores(query: string): Promise<BackendStore[]> {
    await simulateDelay();
    return searchMockStores(query);
  }

  static async getNearbyStores(latitude: number, longitude: number, radiusKm = 10): Promise<BackendStore[]> {
    await simulateDelay();
    // Simple mock implementation - in real app would calculate actual distance
    return mockStores.slice(0, 3);
  }

  static async getFavoriteStores(userId: string): Promise<BackendStore[]> {
    await simulateDelay();
    const buyer = mockBuyer; // In real app, would get by userId
    return mockStores.filter(store => buyer.favoriteStores.includes(store.id));
  }
}

export class MockReviewService {
  static async getReviewsByProduct(productId: string): Promise<BackendReview[]> {
    await simulateDelay();
    return getMockReviewsByProductId(productId);
  }

  static async createReview(request: CreateReviewRequest): Promise<BackendReview> {
    await simulateDelay();
    const newReview: BackendReview = {
      id: `review-${Date.now()}`,
      productId: request.productId,
      buyerId: mockBuyer.id,
      buyerName: mockBuyer.name,
      buyerAvatar: mockBuyer.avatar,
      content: request.content || null,
      imageUrls: request.imageUrls || null,
      rating: request.rating,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      isVerifiedPurchase: true
    };

    // In a real app, would persist to backend
    mockReviews.push(newReview);
    return newReview;
  }

  static async getReviewsByStore(storeId: string): Promise<BackendReview[]> {
    await simulateDelay();
    const storeProducts = mockProducts.filter(p => p.storeId === storeId);
    const productIds = storeProducts.map(p => p.id);
    return mockReviews.filter(review => productIds.includes(review.productId));
  }
}

export class MockCartService {
  private static CART_STORAGE_KEY = 'mock_cart';

  static async getCartItems(userId: string): Promise<BackendCartItem[]> {
    await simulateDelay();
    try {
      const storedCart = await AsyncStorage.getItem(this.CART_STORAGE_KEY);
      if (storedCart) {
        const cartItems: BackendCartItem[] = JSON.parse(storedCart);
        // Populate product details
        return cartItems.map(item => ({
          ...item,
          product: getMockProductById(item.productId)!
        }));
      }
      return mockCartItems;
    } catch {
      return mockCartItems;
    }
  }

  static async addToCart(userId: string, request: AddToCartRequest): Promise<BackendCartItem> {
    await simulateDelay();
    const product = getMockProductById(request.productId);
    if (!product) throw new Error('Product not found');

    const newItem: BackendCartItem = {
      id: `cart-${Date.now()}`,
      buyerId: userId,
      productId: request.productId,
      product,
      quantity: request.quantity,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update local storage
    const currentCart = await this.getCartItems(userId);
    const existingItem = currentCart.find(item => item.productId === request.productId);
    
    if (existingItem) {
      existingItem.quantity += request.quantity;
      existingItem.updatedAt = new Date().toISOString();
    } else {
      currentCart.push(newItem);
    }

    await AsyncStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(currentCart));
    return existingItem || newItem;
  }

  static async updateCartItem(userId: string, request: UpdateCartItemRequest): Promise<BackendCartItem> {
    await simulateDelay();
    const currentCart = await this.getCartItems(userId);
    const item = currentCart.find(item => item.id === request.id);
    
    if (!item) throw new Error('Cart item not found');
    
    item.quantity = request.quantity;
    item.updatedAt = new Date().toISOString();
    
    await AsyncStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(currentCart));
    return item;
  }

  static async removeCartItem(userId: string, itemId: string): Promise<void> {
    await simulateDelay();
    const currentCart = await this.getCartItems(userId);
    const updatedCart = currentCart.filter(item => item.id !== itemId);
    await AsyncStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(updatedCart));
  }

  static async clearCart(userId: string): Promise<void> {
    await simulateDelay();
    await AsyncStorage.removeItem(this.CART_STORAGE_KEY);
  }
}

export class MockOrderService {
  private static ORDER_STORAGE_KEY = 'mock_orders';

  static async getOrdersByUser(userId: string): Promise<BackendOrder[]> {
    await simulateDelay();
    try {
      const storedOrders = await AsyncStorage.getItem(this.ORDER_STORAGE_KEY);
      if (storedOrders) {
        return JSON.parse(storedOrders);
      }
      return mockOrders.filter(order => order.buyerId === userId);
    } catch {
      return mockOrders.filter(order => order.buyerId === userId);
    }
  }

  static async getOrderById(orderId: string): Promise<BackendOrder | null> {
    await simulateDelay();
    const orders = await this.getOrdersByUser(mockBuyer.id);
    return orders.find(order => order.id === orderId) || null;
  }

  static async createOrder(userId: string, request: CreateOrderRequest): Promise<BackendOrder> {
    await simulateDelay();
    const store = getMockStoreById(request.storeId);
    if (!store) throw new Error('Store not found');

    const products = request.items.map(item => getMockProductById(item.productId)).filter(Boolean) as BackendProduct[];
    const totalPrice = request.items.reduce((total, item) => {
      const product = getMockProductById(item.productId);
      return total + (product ? product.discountedPrice * item.quantity : 0);
    }, 0);

    const newOrder: BackendOrder = {
      id: `order-${Date.now()}`,
      buyerId: userId,
      storeId: request.storeId,
      storeName: store.name,
      productId: request.items.map(item => item.productId),
      productNames: products.map(product => product.name),
      quantity: request.items.map(item => item.quantity),
      unitPrices: products.map(product => product.discountedPrice),
      totalPrice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: OrderStatus.Pending,
      deliveryAddress: request.deliveryAddress,
      notes: request.notes
    };

    const currentOrders = await this.getOrdersByUser(userId);
    currentOrders.push(newOrder);
    await AsyncStorage.setItem(this.ORDER_STORAGE_KEY, JSON.stringify(currentOrders));

    return newOrder;
  }

  static async updateOrder(request: UpdateOrderRequest): Promise<BackendOrder> {
    await simulateDelay();
    const currentOrders = await this.getOrdersByUser(mockBuyer.id);
    const order = currentOrders.find(order => order.id === request.id);
    
    if (!order) throw new Error('Order not found');
    
    if (request.status !== undefined) order.status = request.status;
    if (request.paymentStatus !== undefined) order.paymentStatus = request.paymentStatus;
    if (request.deliveryDate !== undefined) order.deliveryDate = request.deliveryDate;
    if (request.notes !== undefined) order.notes = request.notes;
    
    order.updatedAt = new Date().toISOString();
    
    await AsyncStorage.setItem(this.ORDER_STORAGE_KEY, JSON.stringify(currentOrders));
    return order;
  }

  static async getOrdersByStatus(userId: string, status: OrderStatus): Promise<BackendOrder[]> {
    await simulateDelay();
    const orders = await this.getOrdersByUser(userId);
    return orders.filter(order => order.status === status);
  }
}

export class MockUserService {
  static async getCurrentUser(): Promise<BackendBuyer> {
    await simulateDelay();
    return mockBuyer;
  }

  static async updateUser(updates: Partial<BackendBuyer>): Promise<BackendBuyer> {
    await simulateDelay();
    const updatedUser = { ...mockBuyer, ...updates, updatedAt: new Date().toISOString() };
    // In real app, would persist to backend
    return updatedUser;
  }

  static async toggleFavoriteStore(storeId: string): Promise<BackendBuyer> {
    await simulateDelay();
    const favoriteStores = mockBuyer.favoriteStores.includes(storeId)
      ? mockBuyer.favoriteStores.filter(id => id !== storeId)
      : [...mockBuyer.favoriteStores, storeId];
    
    return { ...mockBuyer, favoriteStores, updatedAt: new Date().toISOString() };
  }
}

export class MockNotificationService {
  static async getNotifications(userId: string): Promise<BackendNotification[]> {
    await simulateDelay();
    return mockNotifications.filter(notif => notif.userId === userId);
  }

  static async markAsRead(notificationId: string): Promise<void> {
    await simulateDelay();
    const notification = mockNotifications.find(notif => notif.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    await simulateDelay();
    return mockNotifications.filter(notif => notif.userId === userId && !notif.isRead).length;
  }
}

// Additional mock services for app-specific features
export class MockPostService {
  static async getAllPosts(): Promise<typeof mockPosts> {
    await simulateDelay();
    return mockPosts;
  }

  static async getPostsByStore(storeId: string): Promise<typeof mockPosts> {
    await simulateDelay();
    return mockPosts.filter(post => post.storeId === storeId);
  }
}

export class MockChatService {
  static async getConversations(userId: string): Promise<typeof mockConversations> {
    await simulateDelay();
    return mockConversations;
  }

  static async getConversation(conversationId: string): Promise<typeof mockConversations[0] | null> {
    await simulateDelay();
    return mockConversations.find(conv => conv.id === conversationId) || null;
  }

  static async sendMessage(conversationId: string, message: string): Promise<void> {
    await simulateDelay();
    const conversation = mockConversations.find(conv => conv.id === conversationId);
    if (conversation) {
      conversation.messages.push({
        id: `msg-${Date.now()}`,
        senderId: mockBuyer.id,
        senderType: 'buyer',
        message,
        timestamp: new Date().toISOString()
      });
      conversation.lastMessage = message;
      conversation.lastMessageTime = new Date().toISOString();
    }
  }
}

export class MockCategoryService {
  static async getCategories(): Promise<typeof mockCategories> {
    await simulateDelay();
    return mockCategories;
  }
}