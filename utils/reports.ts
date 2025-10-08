import { API_BASE_URL } from "./api";

export const submitProductReport = async (
  reporterId: string,
  productId: string,
  reason: string,
  description: string,
  token: string
) => {
  const res = await fetch(`${API_BASE_URL}/api/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      reporterId,
      targetId: productId,
      reason,
      description,
      type: "product",
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to submit report.");
  }
  return await res.json();
};

export const submitPostReport = async (
  reporterId: string,
  postId: string,
  reason: string,
  description: string,
  token: string
) => {
  const res = await fetch(`${API_BASE_URL}/api/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      reporterId,
      targetId: postId,
      reason,
      description,
      type: "post",
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to submit report.");
  }
  return await res.json();
};
