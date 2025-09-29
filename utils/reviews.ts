import { API_BASE_URL } from "./constants";

export interface ReviewsFilter {
  rating?: number; // Filter by specific star rating (1-5)
  hasMedia?: boolean; // Filter by reviews with photos/videos
  sortBy?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating';
  limit?: number;
  offset?: number;
}

export const fetchReviews = async (
  token: string | null = null,
  { productId, filters }: { productId: string; filters?: ReviewsFilter }
) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters?.rating) queryParams.append('rating', filters.rating.toString());
    if (filters?.hasMedia !== undefined) queryParams.append('hasMedia', filters.hasMedia.toString());
    if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.offset) queryParams.append('offset', filters.offset.toString());

    const url = `${API_BASE_URL}/api/reviews/product/${productId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in fetchReviews:", error);
    throw error;
  }
};

export const createReview = async (
  token: string | null = null,
  reviewData: {
    productId: string;
    buyerId: string;
    orderId: string | null;
    orderItemId?: string | null;
    content: string;
    imageUrls: string[];
    rating: number;
  }
) => {
  try {
    // Prepare payload with backward compatibility
    const payload = {
      ...reviewData,
      // Include both formats for backend compatibility
      imageUrl: reviewData.imageUrls.length > 0 ? reviewData.imageUrls[0] : null,
      imageUrls: reviewData.imageUrls,
    };
    
    console.log("Creating review with payload:", {
      ...payload,
      imageUrl: payload.imageUrl ? "[URL_PROVIDED]" : null,
      imageUrls: `[${payload.imageUrls.length} URLs]`
    });
    
    const response = await fetch(`${API_BASE_URL}/api/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(payload),
    });
    
    console.log("Create review response status:", response.status);
    console.log("Create review response ok:", response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Create review error response:", errorText);
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log("Create review success response:", result);
    return result;
  } catch (error) {
    console.error("Error in createReview:", error);
    throw error;
  }
};

export const getReviewsByOrderId = async (
  token: string | null = null,
  orderId: string
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reviews/order/${orderId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getReviewsByOrderId:", error);
    throw error;
  }
};

export const getReviewByOrderItemId = async (
  token: string | null = null,
  orderItemId: string
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reviews/orderitem/${orderItemId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
    if (!response.ok) {
      if (response.status === 404) {
        return null; // No review found for this order item
      }
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getReviewByOrderItemId:", error);
    throw error;
  }
};

export const checkOrderItemReviewStatus = async (
  token: string | null = null,
  orderItemId: string
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reviews/orderitem/${orderItemId}/status`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in checkOrderItemReviewStatus:", error);
    throw error;
  }
};

export const updateReview = async (
  token: string | null = null,
  reviewId: string,
  reviewData: {
    productId: string;
    orderId: string;
    orderItemId?: string | null;
    content: string;
    imageUrls: string[];
    rating: number;
  }
) => {
  try {
    // Prepare payload with backward compatibility
    const payload = {
      ...reviewData,
      // Include both formats for backend compatibility
      imageUrl: reviewData.imageUrls.length > 0 ? reviewData.imageUrls[0] : null,
      imageUrls: reviewData.imageUrls,
    };
    
    console.log("Updating review with payload:", {
      ...payload,
      imageUrl: payload.imageUrl ? "[URL_PROVIDED]" : null,
      imageUrls: `[${payload.imageUrls.length} URLs]`
    });
    
    const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(payload),
    });
    
    console.log("Update review response status:", response.status);
    console.log("Update review response ok:", response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Update review error response:", errorText);
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log("Update review success response:", result);
    return result;
  } catch (error) {
    console.error("Error in updateReview:", error);
    throw error;
  }
};

export const deleteReview = async (
  token: string | null = null,
  reviewId: string
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in deleteReview:", error);
    throw error;
  }
};

/**
 * Fetch reviews for a store with filtering support
 */
export const fetchReviewsByStore = async (
  token: string | null = null,
  { storeId, filters }: { storeId: string; filters?: ReviewsFilter }
) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters?.rating) queryParams.append('rating', filters.rating.toString());
    if (filters?.hasMedia !== undefined) queryParams.append('hasMedia', filters.hasMedia.toString());
    if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.offset) queryParams.append('offset', filters.offset.toString());

    const url = `${API_BASE_URL}/api/reviews/store/${storeId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in fetchReviewsByStore:", error);
    throw error;
  }
};

/**
 * Helper method to build filter description text
 */
export const getFilterDescription = (filters: ReviewsFilter): string => {
  const descriptions: string[] = [];
  
  if (filters.rating) {
    descriptions.push(`${filters.rating} star${filters.rating !== 1 ? 's' : ''}`);
  }
  
  if (filters.hasMedia) {
    descriptions.push('with photos');
  }
  
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'newest':
        descriptions.push('newest first');
        break;
      case 'oldest':
        descriptions.push('oldest first');
        break;
      case 'highest_rating':
        descriptions.push('highest rated');
        break;
      case 'lowest_rating':
        descriptions.push('lowest rated');
        break;
    }
  }
  
  return descriptions.length > 0 ? descriptions.join(', ') : 'All reviews';
};

/**
 * Helper method to count active filters
 */
export const getActiveFilterCount = (filters: ReviewsFilter): number => {
  let count = 0;
  if (filters.rating) count++;
  if (filters.hasMedia) count++;
  if (filters.sortBy && filters.sortBy !== 'newest') count++; // 'newest' is default
  return count;
};
