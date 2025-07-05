// Backend data models matching the C# models from the server

export interface BackendProduct {
  id: string;
  name: string;
  description: string;
  productType: string;
  coverImage: string;
  additionalImages: string[];
  originalPrice: number;
  discountedPrice: number;
  expirationDate: string;
  storeId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stock: number;
  rating: number;
  ratingCount: number;
  category: string[];
}

export interface BackendStore {
  id: string;
  sellerId: string;
  name: string;
  storeDescription: string;
  storeImageUrl: string;
  storeCoverUrl: string;
  storeCategory: string;
  tags: string[];
  address: string;
  city: string;
  province: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  rating?: number; // Optional rating for backend store
  reviews?: number; // Optional review count
}

export interface BackendReview {
  id: string;
  productId: string;
  buyerId: string;
  content: string | null;
  imageUrls: string[] | null;
  rating: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface BackendBuyer {
  id: string;
  name: string;
  emailAddress: string;
  createdAt: string;
  favoriteStores: string[];
  latitude?: number;
  longitude?: number;
}

export interface UpdateFavoriteStoreRequest {
  storeId: string;
  isAdd: boolean;
}

export interface BackendOrder {
  id: string;
  buyerId: string;
  storeId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
}

export enum OrderStatus {
  Pending = 0,
  Confirmed = 1,
  Completed = 2,
  Cancelled = 3,
}
