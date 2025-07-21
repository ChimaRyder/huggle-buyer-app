import { API_BASE_URL } from "./api";

// Order API functions
export const createOrder = async (orderData: any, token: string | null) => {
  try {
    // Ensure productId and quantity are arrays
    const formattedOrderData = {
      ...orderData,
      productId: Array.isArray(orderData.productId)
        ? orderData.productId
        : [orderData.productId],
      quantity: Array.isArray(orderData.quantity)
        ? orderData.quantity
        : [orderData.quantity],
    };

    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(formattedOrderData),
    });

    console.log("Bearer", token);
    console.log("Order Data:", formattedOrderData);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Add a new function specifically for creating orders from cart items
export const createMultipleOrders = async (
  cartItems: any[],
  storeId: string,
  totalPrice: number,
  token: string | null
) => {
  try {
    const productIds = cartItems.map((item) => item.productId);
    const quantities = cartItems.map((item) => item.quantity);

    const orderData = {
      storeId,
      productId: productIds,
      quantity: quantities,
      totalPrice,
      status: 0, // Pending
    };

    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating order from cart:", error);
    throw error;
  }
};

// Get all orders for the current user
export const getOrders = async (token: string | null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
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
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
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
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
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
