import { API_BASE_URL } from "./constants";
import type { BackendPost } from '@/types/BackendModels';

/**
 * @deprecated Use PostContext instead
 * Fetch all posts from the backend
 */
export const fetchPosts = async (token: string | null = null, page: number = 1, pageSize: number = 20) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts?page=${page}&pageSize=${pageSize}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
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

export const getPostsByStoreId = async (
  token: string | null = null,
  storeId: string
) => {
  try {
    const url = `${API_BASE_URL}/api/posts/store/${storeId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
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
    console.error("Error fetching posts:", error);
    throw error;
  }
};

/**
 * @deprecated Use PostContext instead
 * Like a post
 */
export const likePost = async (postId: string, token: string | null = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
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

/**
 * @deprecated Use PostContext instead
 * Unlike a post
 */
export const unlikePost = async (
  postId: string,
  token: string | null = null
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
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

/**
 * @deprecated The backend now includes isLiked status in post data
 * @note This function is no longer needed as posts include like status
 */
