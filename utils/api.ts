// API utility functions
// const API_BASE_URL = "https://huggle-backend-jh2l.onrender.com";
//const API_BASE_URL = "http://192.168.1.43:5132";
// const API_BASE_URL = "http://localhost:5132";
const API_BASE_URL = "https://l4f9xg2c-5132.asse.devtunnels.ms";

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

/**
 * Fetch live search suggestions for products and stores by query
 * @param query Partial search string
 * @param token Optional auth token
 * @returns { products: Product[], stores: Store[] }
 */
const fetchSearchSuggestions = async (
  query: string,
  token: string | null = null
) => {
  try {
    const headers = createHeaders(token);
    // Fetch products and stores in parallel
    const [productsRes, storesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/products/display?search=${encodeURIComponent(query)}`, { headers }),
      fetch(`${API_BASE_URL}/api/stores/display?search=${encodeURIComponent(query)}`, { headers })
    ]);
    if (!productsRes.ok || !storesRes.ok) {
      throw new Error(`Error: ${productsRes.status} / ${storesRes.status}`);
    }
    const [products, stores] = await Promise.all([
      productsRes.json(),
      storesRes.json()
    ]);
    return { products, stores };
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return { products: [], stores: [] };
  }
};

// Fetch both stores and products matching the query
export const fetchSearchResults = async (
  query: string,
  token: string | null = null
) => {
  try {
    const headers = createHeaders(token);
    const [storesRes, productsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/stores/display?search=${encodeURIComponent(query)}`, { headers }),
      fetch(`${API_BASE_URL}/api/products/display?search=${encodeURIComponent(query)}`, { headers }),
    ]);
    if (!storesRes.ok || !productsRes.ok) {
      throw new Error('Failed to fetch search results');
    }
    const stores = await storesRes.json();
    const products = await productsRes.json();
    return { stores, products };
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};

export { fetchSearchSuggestions };

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

    const url = `${API_BASE_URL}/api/stores/${storeId}`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
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
      `${API_BASE_URL}/api/buyer/${buyerId}/favorite-stores`,
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
    const response = await fetch(`${API_BASE_URL}/api/buyer/${buyerId}`, {
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Cart API functions
export const addToCart = async (
  itemId: string,
  amount: number,
  token: string | null = null
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
      method: "POST",
      headers: createHeaders(token),
      body: JSON.stringify({
        itemId,
        amount,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

export const getCart = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cart`, {
      headers: createHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

export const updateCartItem = async (
  itemId: string,
  amount: number,
  token: string
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
      method: "PUT",
      headers: createHeaders(token),
      body: JSON.stringify({
        itemId,
        amount,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

export const removeFromCart = async (itemId: string, token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cart/items/${itemId}`, {
      method: "DELETE",
      headers: createHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
};

export const clearCart = async (token: string | null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cart`, {
      method: "DELETE",
      headers: createHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};

// Order API functions
export const createOrder = async (orderData: any, token: string | null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: "POST",
      headers: createHeaders(token),
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const createMultipleOrders = async (
  orderDataArray: any[],
  token: string | null
) => {
  try {
    const orderPromises = orderDataArray.map((orderData) =>
      fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: createHeaders(token),
        body: JSON.stringify(orderData),
      })
    );

    const responses = await Promise.all(orderPromises);
    const allSuccessful = responses.every((response) => response.ok);

    if (!allSuccessful) {
      throw new Error("Some orders failed to place");
    }

    // Parse all responses
    const orderResults = await Promise.all(
      responses.map((response) => response.json())
    );

    return orderResults;
  } catch (error) {
    console.error("Error creating multiple orders:", error);
    throw error;
  }
};

// Get all orders for the current user
export const getOrders = async (token: string | null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      headers: createHeaders(token),
    });

    console.log("Bearer", token);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// Get a specific order by ID
export const getOrderById = async (orderId: string, token: string | null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
      headers: createHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (
  orderId: string,
  orderData: any,
  token: string | null
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
      method: "PUT",
      headers: createHeaders(token),
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

// Cancel order
export const cancelOrder = async (orderId: string, token: string | null) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/orders/${orderId}/cancel`,
      {
        method: "PUT",
        headers: createHeaders(token),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
};
