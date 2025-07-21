import { API_BASE_URL } from "./api";

// Fetch all posts from the backend
// TODO ADD product type prop and add it to params para sa homepage
export const fetchPosts = async (token: string | null = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/display/posts`, {
      method: "GET",
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
    console.error("Error fetching posts:", error);
    throw error;
  }
};
