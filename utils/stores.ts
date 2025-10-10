import { API_BASE_URL } from "./constants";

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

export const followStore = async (
  storeId: string,
  userId: string,
  token: string | null = null
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/storefollower/${storeId}/follow/${userId}`,
      {
        method: "POST",
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
    console.error(`Error following store ${storeId}:`, error);
    throw error;
  }
};

export const unfollowStore = async (
  storeId: string,
  userId: string,
  token: string | null = null
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/storefollower/${storeId}/unfollow/${userId}`,
      {
        method: "DELETE",
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
    console.error(`Error unfollowing store ${storeId}:`, error);
    throw error;
  }
};

export const fetchFollowedStores = async (
  userId: string,
  token: string | null = null
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/storefollower/user/${userId}/stores`,
      {
        method: "GET",
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
    console.error(`Error fetching followed stores for user ${userId}:`, error);
    throw error;
  }
};
