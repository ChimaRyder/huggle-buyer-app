import { API_BASE_URL } from "./constants";

// Log API base URL for debugging
console.log('⚙️ Cart API: Using API_BASE_URL:', API_BASE_URL);

// Cart API functions
export const addToCart = async (
  productId: string,
  quantity: number,
  token: string | null = null
) => {
  try {
    const requestBody = {
      productId,
      quantity,
    };
    
    console.log('📡 Cart API: addToCart request', {
      url: `${API_BASE_URL}/api/cart/items`,
      method: 'POST',
      productId,
      quantity,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 10) + '...' : 'NO_TOKEN',
      requestBody
    });
    
    const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('📝 Cart API: addToCart response status', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMsg =
        errorBody.message || response.statusText || `Error: ${response.status}`;
      
      console.error('❌ Cart API: addToCart failed', {
        status: response.status,
        statusText: response.statusText,
        errorBody,
        errorMessage: errorMsg
      });
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
                    const result = await addToCart(productId, quantity, token);
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

    const result = await response.json();
    console.log('✅ Cart API: addToCart success', {
      result,
      status: response.status
    });
    return result;
  } catch (error) {
    console.error('❌ Cart API: addToCart exception', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

export const getCart = async (token: string) => {
  try {
    console.log('📡 Cart API: getCart request', {
      url: `${API_BASE_URL}/api/cart`,
      method: 'GET',
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 10) + '...' : 'NO_TOKEN'
    });
    
    const response = await fetch(`${API_BASE_URL}/api/cart`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    
    console.log('📝 Cart API: getCart response status', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMsg =
        errorBody.message || response.statusText || `Error: ${response.status}`;
      
      console.error('❌ Cart API: getCart failed', {
        status: response.status,
        statusText: response.statusText,
        errorBody,
        errorMessage: errorMsg
      });
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log('✅ Cart API: getCart success', {
      result,
      status: response.status,
      hasData: !!result.data,
      itemsCount: result.data?.items?.length || 0
    });
    return result;
  } catch (error) {
    console.error('❌ Cart API: getCart exception', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

export const updateCartItem = async (
  productId: string,
  quantity: number,
  token: string
) => {
  try {
    const requestBody = {
      productId,
      quantity,
    };
    
    console.log('📡 Cart API: updateCartItem request', {
      url: `${API_BASE_URL}/api/cart/items`,
      method: 'PUT',
      productId,
      quantity,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 10) + '...' : 'NO_TOKEN',
      requestBody
    });
    
    const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('📝 Cart API: updateCartItem response status', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMsg =
        errorBody.message || response.statusText || `Error: ${response.status}`;
      
      console.error('❌ Cart API: updateCartItem failed', {
        status: response.status,
        statusText: response.statusText,
        errorBody,
        errorMessage: errorMsg,
        requestData: { productId, quantity }
      });
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log('✅ Cart API: updateCartItem success', {
      result,
      status: response.status
    });
    return result;
  } catch (error) {
    console.error('❌ Cart API: updateCartItem exception', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      productId,
      quantity
    });
    throw error;
  }
};

export const removeFromCart = async (productId: string, token: string) => {
  try {
    console.log('📡 Cart API: removeFromCart request', {
      url: `${API_BASE_URL}/api/cart/items/${productId}`,
      method: 'DELETE',
      productId,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 10) + '...' : 'NO_TOKEN'
    });
    
    const response = await fetch(`${API_BASE_URL}/api/cart/items/${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    
    console.log('📝 Cart API: removeFromCart response status', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMsg =
        errorBody.message || response.statusText || `Error: ${response.status}`;
      
      console.error('❌ Cart API: removeFromCart failed', {
        status: response.status,
        statusText: response.statusText,
        errorBody,
        errorMessage: errorMsg,
        productId
      });
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log('✅ Cart API: removeFromCart success', {
      result,
      status: response.status
    });
    return result;
  } catch (error) {
    console.error('❌ Cart API: removeFromCart exception', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      productId
    });
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



