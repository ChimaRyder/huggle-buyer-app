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
      const errorBody = await response.json().catch(() => ({}));
      const errorMsg =
        errorBody.message || response.statusText || `Error: ${response.status}`;
      // If error is 409 (Conflict), offer to clear cart and add item again
      if (response.status === 409) {
        // Always use React Native Alert for mobile
        const { Alert } = require("react-native");
        return new Promise((resolve, reject) => {
          Alert.alert(
            "Cart Store Conflict",
            `${errorMsg}\n\nDo you want to clear your cart and add this item?`,
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => reject(new Error(errorMsg)),
              },
              {
                text: "Clear Cart & Add",
                style: "destructive",
                onPress: async () => {
                  try {
                    await clearCart(token);
                    const result = await addToCart(itemId, amount, token);
                    resolve(result);
                  } catch (e) {
                    reject(e);
                  }
                },
              },
            ]
          );
        });
      }
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error) {
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
      const errorBody = await response.json().catch(() => ({}));
      const errorMsg =
        errorBody.message || response.statusText || `Error: ${response.status}`;
      throw new Error(errorMsg);
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
      const errorBody = await response.json().catch(() => ({}));
      const errorMsg =
        errorBody.message || response.statusText || `Error: ${response.status}`;
      throw new Error(errorMsg);
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
      const errorBody = await response.json().catch(() => ({}));
      const errorMsg =
        errorBody.message || response.statusText || `Error: ${response.status}`;
      throw new Error(errorMsg);
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
      const errorBody = await response.json().catch(() => ({}));
      const errorMsg =
        errorBody.message || response.statusText || `Error: ${response.status}`;
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};
