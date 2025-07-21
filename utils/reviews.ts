import { API_BASE_URL } from "./api";

export const fetchReviews = async (
  token: string | null = null,
  { productId }: { productId: string }
) => {
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
};
