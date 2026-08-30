import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

/**
 * Gets or creates a stable device identifier stored in SecureStore.
 */
export async function getOrCreateDeviceId(): Promise<string> {
  if (Platform.OS === "web") return "web-device";
  const key = "circleee_device_id";
  try {
    let deviceId = await SecureStore.getItemAsync(key);
    if (!deviceId) {
      deviceId = "dev_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await SecureStore.setItemAsync(key, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error("Error getting or creating deviceId:", error);
    return "fallback_device_id_" + Date.now();
  }
}

/**
 * Registers device for push notifications, requesting permissions, 
 * configuring Android channels, and returning the token payload.
 */
export async function registerForPushNotifications(): Promise<{
  token: string | null;
  platform: string;
  deviceId: string;
}> {
  const platform = Platform.OS;
  const deviceId = await getOrCreateDeviceId();

  if (Platform.OS === "web") {
    return { token: null, platform, deviceId };
  }

  // 1. Configure Android notification channel
  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("circleee-default", {
        name: "circleee-default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0A84FF",
        showBadge: true,
        enableVibrate: true,
      });
      console.log("Android notification channel 'circleee-default' configured.");
    } catch (error) {
      console.error("Failed to configure Android notification channel:", error);
    }
  }

  // 2. Check and request notification permissions
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Push notification permissions denied by user.");
      return { token: null, platform, deviceId };
    }

    // 3. Obtain project ID from app configuration
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.warn("Project ID not found in Expo configuration. Cannot fetch push token.");
      return { token: null, platform, deviceId };
    }

    // 4. Retrieve Expo push token
    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    console.log("Successfully retrieved Expo Push Token:", tokenResponse.data);
    return { token: tokenResponse.data, platform, deviceId };
  } catch (error) {
    console.error("Gracefully handled error getting push token:", error);
    return { token: null, platform, deviceId };
  }
}
