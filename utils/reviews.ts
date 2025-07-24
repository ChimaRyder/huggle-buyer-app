import { API_BASE_URL } from "./api";

export const fetchReviews = async (
  token: string | null = null,
  { productId }: { productId: string }
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/reviews/product/${productId}`,
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
    return await response.json();
  } catch (error) {
    console.error("Error in fetchReviews:", error);
    throw error;
  }
};

export const createReview = async (
  token: string | null = null,
  reviewData: {
    productId: string;
    buyerId: string;
    orderId: string | null;
    content: string;
    imageUrls: string[];
    rating: number;
  }
) => {
  try {
    console.log("Creating review with data:", reviewData);
    const response = await fetch(`${API_BASE_URL}/api/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(reviewData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in createReview:", error);
    throw error;
  }
};
