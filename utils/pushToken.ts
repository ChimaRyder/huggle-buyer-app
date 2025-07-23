import { API_BASE_URL } from "./api";

export interface PushToken {
  pushToken: string;
  userId: string;
  isActive: boolean;
  [key: string]: any;
}

function buildHeaders(token: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export const addPushToken = async (
  pushToken: PushToken,
  token: string | null
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pushtoken`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(pushToken),
    });
    if (!response.ok) {
      console.error(
        "Failed to add push token:",
        response.status,
        response.statusText
      );
      // If pushToken is not found or other error
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error adding push token:", error);
    return null;
  }
};

export const getPushToken = async (token: string | null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pushtoken`, {
      headers: buildHeaders(token),
    });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }
};

export const updatePushToken = async (
  pushToken: PushToken,
  token: string | null
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pushtoken`, {
      method: "PUT",
      headers: buildHeaders(token),
      body: JSON.stringify(pushToken),
    });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating push token:", error);
    return null;
  }
};

export const disablePushToken = async (
  pushToken: PushToken,
  token: string | null
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pushtoken/disable`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(pushToken),
    });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error disabling push token:", error);
    return null;
  }
};
