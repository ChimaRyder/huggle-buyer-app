interface AppConfig {
  apiBaseUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
  version: string;
}


const getApiBaseUrl = (): string => {
  return "https://rpbwh9rd-5132.asse.devtunnels.ms";
  // return "http://localhost:5132"
};

export const config: AppConfig = {
  apiBaseUrl: getApiBaseUrl(),
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
  version: "1.0.0",
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
  stores: {
    list: "/api/stores",
    byId: (id: string) => `/api/stores/${id}`,
    popular: (latitude: number, longitude: number, radius: number = 5, pageSize: number = 10) => 
      `/api/stores/popular?latitude=${latitude}&longitude=${longitude}&radius=${radius}&pageSize=${pageSize}`,
    search: (latitude: number, longitude: number, radius: number = 5, pageSize: number = 20) => 
      `/api/stores/search?latitude=${latitude}&longitude=${longitude}&radius=${radius}&pageSize=${pageSize}`,
  },
  orders: {
    list: "/api/orders",
    create: "/api/orders",
    byId: (id: string) => `/api/orders/${id}`,
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
} as const;