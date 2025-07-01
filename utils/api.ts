// API utility functions
const API_BASE_URL = "https://huggle-backend-jh2l.onrender.com";
// const API_BASE_URL = "http://localhost:5132";

// Helper function to create headers with auth token if available
const createHeaders = (token: string | null): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const fetchAllProducts = async (token: string | null = null) => {
  try {
    const headers = createHeaders(token);
    const response = await fetch(`${API_BASE_URL}/api/products/display/all`, {
      headers,
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// export const fetchNearbyProducts = async (latitude: number, longitude: number, token: string | null = null) => {
//   try {
//     const headers = createHeaders(token);
//     const response = await fetch(
//       `${API_BASE_URL}/api/products/display/nearby?latitude=${latitude}&longitude=${longitude}`,
//       { headers }
//     );
//     if (!response.ok) {
//       throw new Error(`Error: ${response.status}`);
//     }
//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching nearby products:', error);
//     throw error;
//   }
// };

export const fetchProductById = async (
  productId: string,
  token: string | null = null
) => {
  try {
    const headers = createHeaders(token);
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      headers,
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
};

export const fetchStoreById = async (
  storeId: string,
  token: string | null = null
) => {
  try {
    const headers = createHeaders(token);
    const response = await fetch(
      `${API_BASE_URL}/api/buyer/stores/${storeId}`,
      {
        headers,
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching store ${storeId}:`, error);
    throw error;
  }
};

export const fetchProductsByStoreId = async (
  storeId: string,
  token: string | null = null
) => {
  try {
    const headers = createHeaders(token);
    const response = await fetch(
      `${API_BASE_URL}/api/products/display?storeId=${storeId}`,
      {
        headers,
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();

    // Handle different response formats
    if (Array.isArray(data)) {
      // If response is already an array, return it
      return data;
    } else if (data && typeof data === "object") {
      // If response is an object, check if it has a products property
      if (data.products && Array.isArray(data.products)) {
        return data.products;
      } else {
        // If no products array found, return empty array instead of undefined
        console.warn(
          "Response from API does not contain products array:",
          data
        );
        return [];
      }
    } else {
      // Fallback to empty array
      console.warn("Unexpected response format from API:", data);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching products for store ${storeId}:`, error);
    throw error;
  }
};

export const updateFavoriteStore = async (
  buyerId: string,
  storeId: string,
  isAdd: boolean,
  token: string | null = null
) => {
  try {
    const headers = createHeaders(token);
    const response = await fetch(
      `${API_BASE_URL}/api/buyers/${buyerId}/favorite-stores`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          storeId,
          isAdd,
        }),
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error updating favorite store ${storeId}:`, error);
    throw error;
  }
};

export const fetchBuyerById = async (
  buyerId: string,
  token: string | null = null
) => {
  try {
    const headers = createHeaders(token);
    const response = await fetch(`${API_BASE_URL}/api/buyers/${buyerId}`, {
      headers,
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching buyer ${buyerId}:`, error);
    throw error;
  }
};
