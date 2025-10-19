interface AppConfig {
  apiBaseUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
  version: string;
  streamChat: {
    apiKey: string;
  };
}


const getApiBaseUrl = (): string => {
  // return "https://rpbwh9rd-5132.asse.devtunnels.ms";
  // return "http://10.89.3.46:5132";
  // return "http://10.98.7.44:5132";
  // return "http://192.168.1.8:5132";
  // return "http://localhost:5132"
  // return 'https://rpbwh9rd-5132.asse.devtunnels.ms'
  // return "http://192.168.254.115:5132"
  return "https://huggle-backend-jh2l.onrender.com"
  // return "http://192.168.254.116:5132"
};


export const config: AppConfig = {
  apiBaseUrl: getApiBaseUrl(),
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
  version: "1.0.0",
  streamChat: {
    // For development - replace with your actual Stream API key
    // In production, this should come from environment variables
    apiKey: process.env.EXPO_PUBLIC_STREAM_API_KEY || "your_stream_api_key_here",
  },
};

// API endpoints
export const API_ENDPOINTS = {
  products: {
    display: "/api/products/display",
    trending: "/api/products/trending",
    trendingByLocation: (latitude: number, longitude: number, radiusKm: number = 10, pageSize: number = 20) => 
      `/api/products/trending?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}&pageSize=${pageSize}`,
    byId: (id: string) => `/api/products/${id}`,
    byStore: (storeId: string) => `/api/products/store/${storeId}`,
  },
  bundles: {
    byId: (id: string) => `/api/products/bundles/${id}`,
    byStore: (storeId: string) => `/api/products/bundles/store/${storeId}`,
  },
  stores: {
    list: "/api/stores",
    byId: (id: string) => `/api/stores/${id}`,
    popular: (latitude: number, longitude: number, radius: number = 5, pageSize: number = 10) => 
      `/api/stores/popular?latitude=${latitude}&longitude=${longitude}&radius=${radius}&pageSize=${pageSize}`,
    search: (latitude: number, longitude: number, radius: number = 5, pageSize: number = 20) => 
      `/api/stores/search?latitude=${latitude}&longitude=${longitude}&radius=${radius}&pageSize=${pageSize}`,
  },
  following: {
    followStore: (storeId: string) => `/api/buyers/followstore/${storeId}`,
    unfollowStore: (storeId: string) => `/api/buyers/unfollow/${storeId}`,
    getFollowedStores: "/api/buyers/followed-stores",
    getStoreFollowerInfo: (storeId: string) => `/api/buyers/stores/${storeId}/followers/count`,
  },
  orders: {
    list: "/api/orders",
    create: "/api/orders",
    byId: (id: string) => `/api/orders/${id}`,
    updateStatus: (id: string) => `/api/orders/${id}/status`,
    cancel: (id: string) => `/api/orders/${id}/cancel`,
    canCancel: (id: string) => `/api/orders/${id}/can-cancel`,
  },
  cart: {
    get: "/api/cart",
    add: "/api/cart/add",
    update: "/api/cart/update",
    remove: "/api/cart/remove",
  },
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    refresh: "/api/auth/refresh",
  },
  user: {
    profile: "/api/user/profile",
    update: "/api/user/profile",
  },
  reviews: {
    byProduct: (productId: string) => `/api/reviews/product/${productId}`,
    create: "/api/reviews",
  },
  locations: {
    list: "/api/buyers/locations",
    create: "/api/buyers/locations",
    delete: (id: string) => `/api/buyers/locations/${id}`,
  },
  search: {
    products: "/api/products/search",
    stores: "/api/stores/search",
    storesPopular: "/api/stores/popular",
  },
  posts: {
    list: "/api/posts",
    byId: (id: string) => `/api/posts/${id}`,
    feed: "/api/posts/feed",
    byStore: (storeId: string) => `/api/posts/store/${storeId}`,
    like: (id: string) => `/api/posts/${id}/like`,
  },
  pushTokens: {
    register: "/api/buyers/push-tokens",
    updateStatus: (tokenId: string) => `/api/buyers/push-tokens/${tokenId}`,
  },
} as const;
