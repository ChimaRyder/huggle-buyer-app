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
