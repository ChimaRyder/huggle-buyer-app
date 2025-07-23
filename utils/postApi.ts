import { API_BASE_URL } from "./api";

export const fetchPostById = async (
  postId: string,
  token: string | null = null
) => {
  const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || response.statusText || `Error: ${response.status}`
    );
  }
  return await response.json();
};

export const upvotePost = async (
  postId: string,
  token: string | null = null
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/products/display/posts/${postId}/upvote`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }
  );
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || response.statusText || `Error: ${response.status}`
    );
  }
  return await response.json();
};

export const reportPost = async (
  postId: string,
  reporterId: string,
  reason: string,
  description: string,
  token: string | null = null
) => {
  const response = await fetch(`${API_BASE_URL}/api/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      reporterId,
      targetId: postId,
      reason,
      description,
      type: "post",
    }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || response.statusText || `Error: ${response.status}`
    );
  }
  return await response.json();
};
