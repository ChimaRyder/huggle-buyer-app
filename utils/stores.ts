import { API_BASE_URL } from "./api";

export const fetchStoreById = async (
  storeId: string,
  token: string | null = null
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stores/${storeId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
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

export const updateFavoriteStore = async (
  buyerId: string,
  storeId: string,
  isAdd: boolean,
  token: string | null = null
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/buyer/${buyerId}/favorite-stores`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
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

export const fetchSearchResults = async (
  query: string,
  isProduct: boolean,
  token: string | null = null
) => {
  try {
    const searchParams = new URLSearchParams({
      searchTerm: query,
      searchProducts: isProduct.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/products/display/search?${searchParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );

    console.log("Search URL:", response.url);
    if (!response.ok) {
      throw new Error("Failed to fetch search results");
    }
    const products = await response.json();
    return { products };
  } catch (error) {
    console.error("Error fetching search results:", error);
    throw error;
  }
};
