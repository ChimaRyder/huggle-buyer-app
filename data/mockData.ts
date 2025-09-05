/**
 * Comprehensive Mock Data for Huggle Buyer App
 * This file contains all the mock data used throughout the app for development and testing
 */

import type { 
  BackendProduct, 
  BackendStore, 
  BackendReview, 
  BackendOrder, 
  BackendCartItem, 
  BackendBuyer,
  BackendNotification
} from '../types/BackendModels';
import { OrderStatus, PaymentStatus, NotificationType } from '../types/BackendModels';

// Mock Products
export const mockProducts: BackendProduct[] = [
  {
    id: 'prod-1',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
    productType: 'Electronics',
    coverImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    additionalImages: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500'
    ],
    originalPrice: 299.99,
    discountedPrice: 199.99,
    expirationDate: '2025-12-31T23:59:59Z',
    storeId: 'store-1',
    isActive: true,
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-08-08T15:30:00Z',
    stock: 45,
    rating: 4.5,
    ratingCount: 128,
    category: ['electronics', 'audio', 'headphones']
  },
  {
    id: 'prod-2',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and sustainable organic cotton t-shirt available in multiple colors.',
    productType: 'Clothing',
    coverImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    additionalImages: [
      'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=500'
    ],
    originalPrice: 49.99,
    discountedPrice: 34.99,
    expirationDate: '2025-06-30T23:59:59Z',
    storeId: 'store-2',
    isActive: true,
    createdAt: '2024-07-15T09:00:00Z',
    updatedAt: '2024-08-05T12:00:00Z',
    stock: 120,
    rating: 4.2,
    ratingCount: 89,
    category: ['clothing', 'fashion', 'sustainable']
  },
  {
    id: 'prod-3',
    name: 'Premium Coffee Beans',
    description: 'Single-origin Ethiopian coffee beans, freshly roasted with notes of chocolate and berries.',
    productType: 'Food & Beverages',
    coverImage: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500',
    additionalImages: [
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500'
    ],
    originalPrice: 24.99,
    discountedPrice: 19.99,
    expirationDate: '2024-12-31T23:59:59Z',
    storeId: 'store-3',
    isActive: true,
    createdAt: '2024-08-01T08:00:00Z',
    updatedAt: '2024-08-08T10:00:00Z',
    stock: 75,
    rating: 4.8,
    ratingCount: 203,
    category: ['food', 'beverages', 'coffee', 'organic']
  },
  {
    id: 'prod-4',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracker with heart rate monitoring, GPS, and 7-day battery life.',
    productType: 'Electronics',
    coverImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    additionalImages: [
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500',
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500'
    ],
    originalPrice: 349.99,
    discountedPrice: 279.99,
    expirationDate: '2025-09-30T23:59:59Z',
    storeId: 'store-1',
    isActive: true,
    createdAt: '2024-07-20T14:00:00Z',
    updatedAt: '2024-08-07T16:30:00Z',
    stock: 32,
    rating: 4.6,
    ratingCount: 156,
    category: ['electronics', 'fitness', 'wearables']
  },
  {
    id: 'prod-5',
    name: 'Handcrafted Ceramic Mug',
    description: 'Beautiful handmade ceramic mug perfect for your morning coffee or tea.',
    productType: 'Home & Kitchen',
    coverImage: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500',
    additionalImages: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500'
    ],
    originalPrice: 18.99,
    discountedPrice: 14.99,
    expirationDate: '2025-03-31T23:59:59Z',
    storeId: 'store-4',
    isActive: true,
    createdAt: '2024-06-10T11:00:00Z',
    updatedAt: '2024-08-01T09:15:00Z',
    stock: 89,
    rating: 4.3,
    ratingCount: 67,
    category: ['home', 'kitchen', 'handmade', 'ceramic']
  }
];

// Mock Stores
export const mockStores: BackendStore[] = [
  // Grocery Stores for Orders
  {
    id: 'grocery-1',
    sellerId: 'seller-1',
    name: 'Farm Fresh Market',
    storeDescription: 'Your neighborhood source for fresh, locally-sourced produce and organic fruits and vegetables. We partner with local farms to bring you the freshest products.',
    storeImageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=300',
    storeCoverUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    storeCategory: 'Grocery & Fresh Produce',
    tags: ['grocery', 'fresh produce', 'organic', 'local', 'fruits', 'vegetables'],
    address: '123 Farm Market Lane',
    city: 'San Francisco',
    province: 'California',
    zipCode: '94105',
    latitude: 37.7849,
    longitude: -122.4094,
    rating: 4.7,
    reviews: 456,
    isActive: true,
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-08-08T14:30:00Z'
  },
  {
    id: 'grocery-5',
    sellerId: 'seller-5',
    name: 'Organic Harvest Co.',
    storeDescription: 'Certified organic produce and specialty health foods. We believe in sustainable farming practices and providing the highest quality organic products to our community.',
    storeImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
    storeCoverUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
    storeCategory: 'Organic Foods',
    tags: ['organic', 'health foods', 'sustainable', 'leafy greens', 'specialty produce'],
    address: '456 Organic Way',
    city: 'Berkeley',
    province: 'California',
    zipCode: '94704',
    latitude: 37.8715,
    longitude: -122.2730,
    rating: 4.8,
    reviews: 324,
    isActive: true,
    createdAt: '2023-03-20T09:00:00Z',
    updatedAt: '2024-08-07T11:20:00Z'
  },
  {
    id: 'grocery-6',
    sellerId: 'seller-6',
    name: 'Tropical Paradise',
    storeDescription: 'Exotic fruits and tropical produce from around the world. Experience the flavors of the tropics with our carefully selected premium fruits and specialty items.',
    storeImageUrl: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=300',
    storeCoverUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    storeCategory: 'Specialty Produce',
    tags: ['exotic fruits', 'tropical', 'specialty', 'imported', 'premium'],
    address: '789 Tropical Boulevard',
    city: 'San Jose',
    province: 'California',
    zipCode: '95113',
    latitude: 37.3382,
    longitude: -121.8863,
    rating: 4.6,
    reviews: 278,
    isActive: true,
    createdAt: '2023-05-10T12:00:00Z',
    updatedAt: '2024-08-06T16:45:00Z'
  },
  // Original stores (keeping for backward compatibility)
  {
    id: 'store-1',
    sellerId: 'seller-1',
    name: 'TechHub Electronics',
    storeDescription: 'Your one-stop shop for the latest electronics and gadgets. We offer high-quality products with excellent customer service.',
    storeImageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300',
    storeCoverUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    storeCategory: 'Electronics',
    tags: ['electronics', 'gadgets', 'technology', 'smartphones', 'accessories'],
    address: '123 Tech Street',
    city: 'San Francisco',
    province: 'California',
    zipCode: '94105',
    latitude: 37.7749,
    longitude: -122.4194,
    rating: 4.6,
    reviews: 342,
    isActive: true,
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-08-08T14:30:00Z'
  },
  {
    id: 'store-2',
    sellerId: 'seller-2',
    name: 'Eco Fashion Co.',
    storeDescription: 'Sustainable and ethical fashion for conscious consumers. All our products are made from organic and recycled materials.',
    storeImageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300',
    storeCoverUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
    storeCategory: 'Fashion & Clothing',
    tags: ['sustainable', 'fashion', 'organic', 'eco-friendly', 'clothing'],
    address: '456 Green Avenue',
    city: 'Portland',
    province: 'Oregon',
    zipCode: '97205',
    latitude: 45.5152,
    longitude: -122.6784,
    rating: 4.4,
    reviews: 198,
    isActive: true,
    createdAt: '2023-03-20T09:00:00Z',
    updatedAt: '2024-08-07T11:20:00Z'
  },
  {
    id: 'store-3',
    sellerId: 'seller-3',
    name: 'Bean There Coffee',
    storeDescription: 'Premium coffee roasters specializing in single-origin beans. Fresh roasted daily for the perfect cup.',
    storeImageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300',
    storeCoverUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
    storeCategory: 'Food & Beverages',
    tags: ['coffee', 'roasted', 'premium', 'single-origin', 'fresh'],
    address: '789 Coffee Lane',
    city: 'Seattle',
    province: 'Washington',
    zipCode: '98101',
    latitude: 47.6062,
    longitude: -122.3321,
    rating: 4.8,
    reviews: 567,
    isActive: true,
    createdAt: '2022-11-10T08:00:00Z',
    updatedAt: '2024-08-09T07:45:00Z'
  },
  {
    id: 'store-4',
    sellerId: 'seller-4',
    name: 'Artisan Home',
    storeDescription: 'Handcrafted home goods made by local artisans. Each piece is unique and made with love.',
    storeImageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300',
    storeCoverUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    storeCategory: 'Home & Garden',
    tags: ['handmade', 'artisan', 'home-decor', 'unique', 'local'],
    address: '321 Craft Circle',
    city: 'Austin',
    province: 'Texas',
    zipCode: '73301',
    latitude: 30.2672,
    longitude: -97.7431,
    rating: 4.5,
    reviews: 124,
    isActive: true,
    createdAt: '2023-05-15T12:00:00Z',
    updatedAt: '2024-08-06T15:10:00Z'
  }
];

// Mock Reviews
export const mockReviews: BackendReview[] = [
  {
    id: 'review-1',
    productId: 'prod-1',
    buyerId: 'buyer-1',
    buyerName: 'John Smith',
    buyerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    content: 'Amazing sound quality! The noise cancellation works perfectly and the battery life is exactly as advertised.',
    imageUrls: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
    rating: 5,
    createdAt: '2024-08-05T14:30:00Z',
    updatedAt: null,
    isVerifiedPurchase: true
  },
  {
    id: 'review-2',
    productId: 'prod-1',
    buyerId: 'buyer-2',
    buyerName: 'Sarah Johnson',
    buyerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b412?w=100',
    content: 'Great headphones but took a while to get used to the fit. Sound quality is excellent though.',
    imageUrls: null,
    rating: 4,
    createdAt: '2024-08-03T10:15:00Z',
    updatedAt: null,
    isVerifiedPurchase: true
  },
  {
    id: 'review-3',
    productId: 'prod-3',
    buyerId: 'buyer-3',
    buyerName: 'Mike Chen',
    buyerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    content: 'Best coffee I\'ve ever had! The chocolate notes really come through. Will definitely order again.',
    imageUrls: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'],
    rating: 5,
    createdAt: '2024-08-07T08:20:00Z',
    updatedAt: null,
    isVerifiedPurchase: true
  }
];

// Mock Orders
export const mockOrders: BackendOrder[] = [
  {
    id: 'order-1',
    buyerId: 'buyer-1',
    storeId: 'grocery-1',
    storeName: 'Farm Fresh Market',
    productId: ['101', '103'],
    productNames: ['Organic Apples', 'Organic Carrots'],
    quantity: [2, 1],
    unitPrices: [3.99, 2.49],
    totalPrice: 10.47,
    createdAt: '2024-08-08T15:30:00Z',
    updatedAt: '2024-08-08T16:00:00Z',
    status: OrderStatus.Confirmed,
    paymentStatus: PaymentStatus.Completed,
    deliveryAddress: '123 Main St, San Francisco, CA 94105',
    notes: 'Please select ripe apples'
  },
  {
    id: 'order-2',
    buyerId: 'buyer-1',
    storeId: 'grocery-5',
    storeName: 'Organic Harvest Co.',
    productId: ['201', '202'],
    productNames: ['Kale', 'Spinach'],
    quantity: [1, 2],
    unitPrices: [3.99, 2.99],
    totalPrice: 9.97,
    createdAt: '2024-08-07T09:15:00Z',
    updatedAt: '2024-08-08T10:30:00Z',
    status: OrderStatus.ReadyForPickup,
    paymentStatus: PaymentStatus.Completed,
    deliveryAddress: '123 Main St, San Francisco, CA 94105'
  },
  {
    id: 'order-3',
    buyerId: 'buyer-1',
    storeId: 'grocery-6',
    storeName: 'Tropical Paradise',
    productId: ['301'],
    productNames: ['Mango'],
    quantity: [3],
    unitPrices: [4.99],
    totalPrice: 14.97,
    createdAt: '2024-08-05T12:00:00Z',
    updatedAt: '2024-08-09T14:00:00Z',
    status: OrderStatus.Completed,
    paymentStatus: PaymentStatus.Completed,
    deliveryAddress: '123 Main St, San Francisco, CA 94105'
  },
  {
    id: 'order-4',
    buyerId: 'buyer-1',
    storeId: 'grocery-1',
    storeName: 'Farm Fresh Market',
    productId: ['102', '101'],
    productNames: ['Bananas', 'Organic Apples'],
    quantity: [5, 1],
    unitPrices: [1.99, 3.99],
    totalPrice: 13.94,
    createdAt: '2024-08-06T14:20:00Z',
    updatedAt: '2024-08-06T14:20:00Z',
    status: OrderStatus.Pending,
    paymentStatus: PaymentStatus.Completed,
    deliveryAddress: '123 Main St, San Francisco, CA 94105'
  },
  {
    id: 'order-5',
    buyerId: 'buyer-1',
    storeId: 'grocery-5',
    storeName: 'Organic Harvest Co.',
    productId: ['201'],
    productNames: ['Kale'],
    quantity: [2],
    unitPrices: [3.99],
    totalPrice: 7.98,
    createdAt: '2024-08-04T11:45:00Z',
    updatedAt: '2024-08-05T09:30:00Z',
    status: OrderStatus.Cancelled,
    paymentStatus: PaymentStatus.Refunded,
    deliveryAddress: '123 Main St, San Francisco, CA 94105'
  }
];

// Mock Cart Items
export const mockCartItems: BackendCartItem[] = [
  {
    id: 'cart-1',
    buyerId: 'buyer-1',
    productId: 'prod-2',
    product: mockProducts[1], // Organic Cotton T-Shirt
    quantity: 2,
    addedAt: '2024-08-08T10:00:00Z',
    updatedAt: '2024-08-08T10:00:00Z'
  },
  {
    id: 'cart-2',
    buyerId: 'buyer-1',
    productId: 'prod-5',
    product: mockProducts[4], // Handcrafted Ceramic Mug
    quantity: 1,
    addedAt: '2024-08-08T11:30:00Z',
    updatedAt: '2024-08-08T11:30:00Z'
  }
];

// Mock Buyer
export const mockBuyer: BackendBuyer = {
  id: 'buyer-1',
  name: 'Alex Rodriguez',
  emailAddress: 'alex.rodriguez@example.com',
  phoneNumber: '+1-555-0123',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-08-08T12:00:00Z',
  favoriteStores: ['store-1', 'store-3'],
  latitude: 37.7749,
  longitude: -122.4194,
  isActive: true
};

// Mock Notifications
export const mockNotifications: BackendNotification[] = [
  {
    id: 'notif-1',
    userId: 'buyer-1',
    title: 'Order Ready for Pickup',
    message: 'Your coffee order from Bean There Coffee is ready for pickup!',
    type: NotificationType.OrderUpdate,
    isRead: false,
    data: { orderId: 'order-2', storeId: 'store-3' },
    createdAt: '2024-08-08T10:30:00Z'
  },
  {
    id: 'notif-2',
    userId: 'buyer-1',
    title: 'New Product Available',
    message: 'TechHub Electronics just added new wireless earbuds to their collection!',
    type: NotificationType.ProductUpdate,
    isRead: true,
    data: { productId: 'prod-6', storeId: 'store-1' },
    createdAt: '2024-08-07T15:45:00Z'
  },
  {
    id: 'notif-3',
    userId: 'buyer-1',
    title: 'Special Promotion',
    message: '20% off all sustainable fashion items this weekend only!',
    type: NotificationType.Promotion,
    isRead: false,
    data: { storeId: 'store-2', discountCode: 'SUSTAIN20' },
    createdAt: '2024-08-06T09:00:00Z'
  }
];

// Mock Categories for carousel
export const mockCategories = [
  { id: 'electronics', name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200' },
  { id: 'fashion', name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200' },
  { id: 'food', name: 'Food & Drinks', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200' },
  { id: 'home', name: 'Home & Garden', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200' },
  { id: 'health', name: 'Health & Beauty', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200' },
  { id: 'sports', name: 'Sports', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200' }
];

// Mock Posts (for Instagram-style posts)
export const mockPosts = [
  {
    id: 'post-1',
    storeId: 'store-1',
    storeName: 'TechHub Electronics',
    storeAvatar: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600'
    ],
    caption: 'New wireless headphones just arrived! 🎧 Experience crystal clear sound with our latest addition.',
    likes: 145,
    createdAt: '2024-08-08T14:00:00Z'
  },
  {
    id: 'post-2',
    storeId: 'store-2',
    storeName: 'Eco Fashion Co.',
    storeAvatar: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'
    ],
    caption: 'Sustainable fashion that looks good and feels even better! 🌱 Made from 100% organic cotton.',
    likes: 89,
    createdAt: '2024-08-07T11:30:00Z'
  },
  {
    id: 'post-3',
    storeId: 'store-3',
    storeName: 'Bean There Coffee',
    storeAvatar: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100',
    images: [
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600',
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600'
    ],
    caption: 'Freshly roasted Ethiopian beans ready for your morning brew ☕ Single-origin perfection!',
    likes: 203,
    createdAt: '2024-08-06T08:15:00Z'
  },
  {
    id: 'post-4',
    storeId: 'grocery-1',
    storeName: 'Farm Fresh Market',
    storeAvatar: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100',
    images: [
      'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600',
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600'
    ],
    caption: '🍎 Fresh organic apples just arrived! Perfect for fall baking and snacking. 30% off this week only! #OrganicProduce #FreshFruit',
    likes: 267,
    createdAt: '2024-08-08T09:00:00Z'
  },
  {
    id: 'post-5',
    storeId: 'grocery-2',
    storeName: 'Green Valley Grocers',
    storeAvatar: 'https://images.unsplash.com/photo-1490885578174-acda8905e050?w=100',
    images: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600'
    ],
    caption: '🥬 Weekly produce special! Get 20% off all leafy greens. Fresh kale, spinach, arugula and more! Perfect for your healthy smoothies and salads 💚 #HealthyEating #WeeklySpecial',
    likes: 189,
    createdAt: '2024-08-07T16:45:00Z'
  },
  {
    id: 'post-6',
    storeId: 'grocery-3',
    storeName: 'Tropical Paradise',
    storeAvatar: 'https://images.unsplash.com/photo-1515281508107-6e0d239c10a5?w=100',
    images: [
      'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=600',
      'https://images.unsplash.com/photo-1603047579504-19419bf1a56d?w=600',
      'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600'
    ],
    caption: '🥭🍍 Exotic fruit paradise! Fresh mangoes, pineapples, and dragon fruit now available. Buy 2 get 1 FREE on all tropical fruits! #TropicalFruits #ExoticProduce #SpecialDeal',
    likes: 324,
    createdAt: '2024-08-07T12:20:00Z'
  },
  {
    id: 'post-7',
    storeId: 'grocery-4',
    storeName: 'Berry Best Market',
    storeAvatar: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=100',
    images: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
      'https://images.unsplash.com/photo-1583554425806-76ae3c4baf33?w=600'
    ],
    caption: '🍓 Berry season is here! Fresh strawberries and blueberries picked this morning. Perfect for desserts, smoothies, or just snacking! Limited supply - get them while they last! #FreshBerries #SeasonalProduce',
    likes: 156,
    createdAt: '2024-08-06T14:30:00Z'
  },
  {
    id: 'post-8',
    storeId: 'grocery-5',
    storeName: 'Organic Harvest Co.',
    storeAvatar: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=100',
    images: [
      'https://images.unsplash.com/photo-1582515073490-39981397c445?w=600',
      'https://images.unsplash.com/photo-1598170845058-325f3c253194?w=600'
    ],
    caption: '🥕🍠 Root vegetable bonanza! Fresh organic carrots, sweet potatoes, beets and parsnips. All locally grown and pesticide-free. 25% off bundles of 3 or more! #OrganicVeggies #LocalProduce #HealthyChoices',
    likes: 198,
    createdAt: '2024-08-06T10:15:00Z'
  },
  {
    id: 'post-9',
    storeId: 'grocery-6',
    storeName: 'Metro Fresh Foods',
    storeAvatar: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100',
    images: [
      'https://images.unsplash.com/photo-1594759312175-6bb4ba56480c?w=600'
    ],
    caption: '🛒 Weekend grocery haul special! Fill your cart with fresh produce and save big. Spend $50+ and get 15% off your entire order! Valid this weekend only 🎯 #WeekendSpecial #GroceryDeals #FreshProduce',
    likes: 445,
    createdAt: '2024-08-05T18:00:00Z'
  },
  {
    id: 'post-10',
    storeId: 'grocery-7',
    storeName: 'Garden Fresh Market',
    storeAvatar: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100',
    images: [
      'https://images.unsplash.com/photo-1585332168612-ef7c3f2c49e7?w=600',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600'
    ],
    caption: '🌿 Herb garden fresh! Basil, cilantro, parsley, thyme and more. Hand-picked this morning for maximum flavor. Perfect for your homemade meals! Buy 3 herbs get the 4th FREE! #FreshHerbs #CookingIngredients #GardenFresh',
    likes: 112,
    createdAt: '2024-08-05T11:45:00Z'
  },
  {
    id: 'post-11',
    storeId: 'grocery-8',
    storeName: 'City Farmers Market',
    storeAvatar: 'https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?w=100',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
      'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600'
    ],
    caption: '🎪 Farmers Market Wednesday! Join us for the freshest local produce, artisanal goods, and community vibes. Every Wednesday 8AM-2PM. See you there! #FarmersMarket #LocalProduce #Community #WednesdayMarket',
    likes: 287,
    createdAt: '2024-08-04T20:00:00Z'
  },
  {
    id: 'post-12',
    storeId: 'grocery-1',
    storeName: 'Farm Fresh Market',
    storeAvatar: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100',
    images: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600'
    ],
    caption: '🥬 Spinach power! Fresh baby spinach leaves packed with iron and nutrients. Perfect for salads, smoothies, and cooking. Get your greens today! #SpinachPower #HealthyEating #IronRich #BabySpinach',
    likes: 134,
    createdAt: '2024-08-04T13:20:00Z'
  }
];

// Mock Chat Conversations
export const mockConversations = [
  {
    id: 'conv-1',
    storeId: 'store-1',
    storeName: 'TechHub Electronics',
    storeAvatar: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100',
    lastMessage: 'Your order is ready for pickup!',
    lastMessageTime: '2024-08-08T16:00:00Z',
    unreadCount: 1,
    messages: [
      {
        id: 'msg-1',
        senderId: 'buyer-1',
        senderType: 'buyer',
        message: 'Hi, I have a question about the warranty on the headphones.',
        timestamp: '2024-08-08T15:30:00Z'
      },
      {
        id: 'msg-2',
        senderId: 'store-1',
        senderType: 'store',
        message: 'Hello! The headphones come with a 2-year manufacturer warranty.',
        timestamp: '2024-08-08T15:35:00Z'
      },
      {
        id: 'msg-3',
        senderId: 'store-1',
        senderType: 'store',
        message: 'Your order is ready for pickup!',
        timestamp: '2024-08-08T16:00:00Z'
      }
    ]
  },
  {
    id: 'conv-2',
    storeId: 'store-3',
    storeName: 'Bean There Coffee',
    storeAvatar: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100',
    lastMessage: 'Thank you for your order!',
    lastMessageTime: '2024-08-07T10:00:00Z',
    unreadCount: 0,
    messages: [
      {
        id: 'msg-4',
        senderId: 'buyer-1',
        senderType: 'buyer',
        message: 'Do you have decaf options?',
        timestamp: '2024-08-07T09:45:00Z'
      },
      {
        id: 'msg-5',
        senderId: 'store-3',
        senderType: 'store',
        message: 'Yes! We have Swiss Water Process decaf available.',
        timestamp: '2024-08-07T09:50:00Z'
      },
      {
        id: 'msg-6',
        senderId: 'store-3',
        senderType: 'store',
        message: 'Thank you for your order!',
        timestamp: '2024-08-07T10:00:00Z'
      }
    ]
  }
];

// Helper functions to get mock data
export const getMockProductById = (id: string): BackendProduct | undefined => {
  return mockProducts.find(product => product.id === id);
};

export const getMockStoreById = (id: string): BackendStore | undefined => {
  return mockStores.find(store => store.id === id);
};

export const getMockReviewsByProductId = (productId: string): BackendReview[] => {
  return mockReviews.filter(review => review.productId === productId);
};

export const getMockOrdersByStatus = (status: OrderStatus): BackendOrder[] => {
  return mockOrders.filter(order => order.status === status);
};

export const searchMockProducts = (query: string): BackendProduct[] => {
  const lowerQuery = query.toLowerCase();
  return mockProducts.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) ||
    product.description.toLowerCase().includes(lowerQuery) ||
    product.category.some(cat => cat.toLowerCase().includes(lowerQuery))
  );
};

export const searchMockStores = (query: string): BackendStore[] => {
  const lowerQuery = query.toLowerCase();
  return mockStores.filter(store => 
    store.name.toLowerCase().includes(lowerQuery) ||
    store.storeDescription.toLowerCase().includes(lowerQuery) ||
    store.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};