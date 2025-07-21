import { API_BASE_URL } from "./api";

// Cart API functions
export const addToCart = async (
  itemId: string,
  amount: number,
  token: string | null = null
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
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
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
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
    console.error("Error removing from cart:", error);
    throw error;
  }
};

export const clearCart = async (token: string | null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cart`, {
      method: "DELETE",
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
    console.error("Error clearing cart:", error);
    throw error;
  }
};
