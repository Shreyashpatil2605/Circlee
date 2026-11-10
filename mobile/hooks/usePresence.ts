import { useApiClient, userApi } from "@/utils/api";
import { useMutation as useRQMutation } from "@tanstack/react-query";
import { useMutation as useConvexMutation } from "convex/react";
import { api as convexApi } from "@/convex/_generated/api";
import { useCallback } from "react";
import { useAuth } from "@clerk/clerk-expo";

export const usePresence = () => {
  const apiClient = useApiClient();
  const { userId, isSignedIn, getToken } = useAuth();
  const convexUpdatePresence = useConvexMutation(convexApi.users.updatePresence);

  const { mutate, mutateAsync } = useRQMutation({
    mutationFn: async (isOnline: boolean) => {
      if (!isSignedIn) return;

      // 1. Update Convex for instant real-time subscription
      try {
        await convexUpdatePresence({
          isOnline,
          clerkId: userId ?? undefined,
        });
      } catch (convexErr) {
        console.warn("[usePresence] Convex presence update error:", convexErr);
      }

      // 2. Update backend MongoDB
      try {
        const token = await getToken();
        if (!token) return;
        return await userApi.updatePresence(apiClient, isOnline);
      } catch (mongoErr: any) {
        if (mongoErr?.response?.status !== 401) {
          console.warn("[usePresence] Backend presence update error:", mongoErr);
        }
      }
    },
  });

  const updatePresence = useCallback(
    (isOnline: boolean) => mutate(isOnline),
    [mutate]
  );

  const updatePresenceAsync = useCallback(
    (isOnline: boolean) => mutateAsync(isOnline),
    [mutateAsync]
  );

  return {
    updatePresence,
    updatePresenceAsync,
  };
};
