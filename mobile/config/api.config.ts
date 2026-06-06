import { Platform } from "react-native";

/**
 * API Configuration for different environments
 *
 * Platform-specific URLs:
 * - Android Emulator: 10.0.2.2 (default Android emulator bridge IP)
 * - iOS Simulator: localhost or 127.0.0.1
 * - Physical Device: Your machine's IP address (e.g., 192.168.x.x)
 * - Web: localhost
 */

export const getApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  if (envUrl) {
    return envUrl;
  }

  // Fallback based on platform
  if (Platform.OS === "android") {
    // Android emulator uses 10.0.2.2 to refer to the host machine
    return "http://10.0.2.2:5001";
  } else if (Platform.OS === "ios") {
    // iOS simulator can use localhost
    return "http://localhost:5001";
  } else {
    // Web
    return "http://localhost:5001";
  }
};

export const API_BASE_URL = getApiBaseUrl() + "/api";
