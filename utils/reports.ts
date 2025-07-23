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
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to submit report.");
  }
  return await res.json();
};
