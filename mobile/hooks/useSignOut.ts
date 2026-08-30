import { useClerk } from "@clerk/clerk-expo";
import { Alert } from "react-native";
import { useApiClient } from "@/utils/api";
import { registerForPushNotifications } from "@/utils/registerForPushNotifications";

export const useSignOut = () => {
  const { signOut } = useClerk();
  const api = useApiClient();

  const handleSignOut = () => {
    Alert.alert("Logout", "Are you sure you really want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // Retrieve current push token details to deregister
            const { token, deviceId } = await registerForPushNotifications();
            if (token || deviceId) {
              console.log("Deregistering push token before logout:", token);
              await api.delete("/notifications/push-token", {
                data: { token, deviceId }, // axios delete payload is sent in the data config
              });
            }
          } catch (error) {
            console.error("Failed to deregister push token on logout:", error);
          } finally {
            signOut();
          }
        },
      },
    ]);
  };
  return { handleSignOut };
};
