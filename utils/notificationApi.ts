import { API_BASE_URL } from "./api";

export const getNotifications = async (
  userId: string,
  token: string | null,
  unreadOnly = false
) => {
  const url = `${API_BASE_URL}/api/notifications?userId=${userId}&unreadOnly=${unreadOnly}`;
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
  const url = `${API_BASE_URL}/api/notifications/unread-count?userId=${userId}`;
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
  const url = `${API_BASE_URL}/api/notifications/mark-all-read?userId=${userId}`;
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
