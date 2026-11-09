import { useClerk } from "@clerk/clerk-expo";
import { useApiClient } from "@/utils/api";
import { registerForPushNotifications } from "@/utils/registerForPushNotifications";
import { modalService } from "@/context/ModalContext";

export const useSignOut = () => {
  const { signOut } = useClerk();
  const api = useApiClient();

  const handleSignOut = () => {
    modalService.showAlert({
      title: "Log out of Circlee?",
      description: "Are you sure you want to log out? You can sign back in at any time.",
      icon: "log-out",
      type: "danger",
      isDestructive: true,
      confirmText: "Log Out",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          // Retrieve current push token details to deregister
          const { token, deviceId } = await registerForPushNotifications();
          if (token || deviceId) {
            console.log("Deregistering push token before logout...");
            await api.delete("/notifications/push-token", {
              headers: { "Content-Type": "application/json" },
              data: { token, deviceId },
              params: {
                token: token || undefined,
                deviceId: deviceId || undefined,
              },
            });
          }
        } catch (error: any) {
          console.warn(
            "Failed to deregister push token on logout:",
            error?.response?.data || error?.message || error
          );
        } finally {
          try {
            await signOut();
            modalService.showToast("Signed out successfully", "info");
          } catch (signOutError) {
            console.error("Clerk signOut error:", signOutError);
            modalService.showToast("Failed to sign out. Please try again.", "error");
          }
        }
      },
    });
  };
  return { handleSignOut };
};

export default useSignOut;
