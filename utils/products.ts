import { API_BASE_URL } from "./api";

export const fetchAllProducts = async (token: string, productType?: string) => {
  try {
    let url = `${API_BASE_URL}/api/products/display`;
    if (productType) {
      url += `?productCategory=${encodeURIComponent(productType)}`;
    }
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const fetchProductById = async (
  productId: string,
  token: string | null = null
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error response for product ${productId}:`, errorText);
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
};

export const fetchProductsByStoreId = async (
  storeId: string,
  token: string | null = null
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/products/store/${storeId}`,
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
