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
    console.error("Error fetching posts yawa:", error);
    throw error;
  }
};

export const getPostsByStoreId = async (
  token: string | null = null,
  storeId: string
) => {
  try {
    const url = `${API_BASE_URL}/api/products/posts/${storeId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    console.log("Response status:", response.status);
    if (response.status === 404) {
      return [];
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching posts otin:", error);
    throw error;
  }
};

// Like a post
export const likePost = async (postId: string, token: string | null = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
      method: "POST",
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
    console.error("Error liking post:", error);
    throw error;
  }
};

// Unlike a post
export const unlikePost = async (
  postId: string,
  token: string | null = null
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
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
    console.error("Error unliking post:", error);
    throw error;
  }
};

// Check if post is liked by current user
export const isPostLiked = async (
  postId: string,
  token: string | null = null
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    return data.liked;
  } catch (error) {
    console.error("Error checking if post is liked:", error);
    throw error;
  }
};
