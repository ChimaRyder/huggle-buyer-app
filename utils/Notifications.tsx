import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { storePushToken } from "./notificationApi";

export async function registerForPushNotificationsAsync(authToken?: string | null) {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("Push notification permission denied");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    
    // Store token in backend if auth token is provided
    if (token && authToken) {
      try {
        await storePushToken(token, authToken);
        console.log("Push token stored in backend successfully");
      } catch (error) {
        console.error("Failed to store push token in backend:", error);
      }
    }
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return token;
}
