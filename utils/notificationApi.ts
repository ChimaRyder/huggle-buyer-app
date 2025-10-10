import { API_BASE_URL } from "./api";

export const getNotifications = async (
  userId: string,
  token: string | null,
  unreadOnly = false
) => {
  const url = `${API_BASE_URL}/api/notifications?unreadOnly=${unreadOnly}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch notifications");
  return response.json();
};

export const getUnreadNotificationCount = async (
  userId: string,
  token: string | null
) => {
  const url = `${API_BASE_URL}/api/notifications/unread-count`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch unread count");
  return response.json();
};

export const markNotificationAsRead = async (
  notificationId: string,
  token: string | null
) => {
  const url = `${API_BASE_URL}/api/notifications/${notificationId}/read`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  if (!response.ok) throw new Error("Failed to mark notification as read");
  return response.json();
};

export const markAllNotificationsAsRead = async (
  userId: string,
  token: string | null
) => {
  const url = `${API_BASE_URL}/api/notifications/mark-all-read`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  if (!response.ok) throw new Error("Failed to mark all as read");
  return response.json();
};

export const deleteNotification = async (
  notificationId: string,
  token: string | null
) => {
  const url = `${API_BASE_URL}/api/notifications/${notificationId}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  if (!response.ok) throw new Error("Failed to delete notification");
  return response.json();
};

export const storePushToken = async (
  pushToken: string,
  token: string | null
) => {
  const url = `${API_BASE_URL}/api/notifications/push-token`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ PushToken: pushToken }),
  });
  if (!response.ok) throw new Error("Failed to store push token");
  return response.json();
};
