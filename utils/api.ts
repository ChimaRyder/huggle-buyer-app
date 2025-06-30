// API utility functions

const API_BASE_URL = "https://huggle-backend-jh2l.onrender.com";

export const fetchAllProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/display/all`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// export const fetchNearbyProducts = async (latitude: number, longitude: number) => {
//   try {
//     const response = await fetch(
//       `${API_BASE_URL}/api/products/display/nearby?latitude=${latitude}&longitude=${longitude}`
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

export const fetchProductById = async (productId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
};

export const fetchStoreById = async (storeId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buyer/stores/${storeId}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching store ${storeId}:`, error);
    throw error;
  }
};
