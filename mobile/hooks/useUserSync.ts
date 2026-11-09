import { useApiClient, userApi } from "@/utils/api";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export const useUserSync = () => {
  const { isSignedIn } = useAuth();
  const api = useApiClient();
  const hasSyncedRef = useRef(false);

  const { mutate } = useMutation({
    // so here we are saving the user in the mongoDB
    mutationFn: () => userApi.syncUser(api),
    onSuccess: (response: any) =>
      console.log("User Synced Successfully:", response.data.user),
    onError: (error: any) => {
      console.log("User Synced failed: ", error);
      console.log("Status:", error?.response?.status);
      console.log("Data:", error?.response?.data);
      console.log("Message:", error?.message);
    },
  });

  // AutoSync user once when signed in
  useEffect(() => {
    if (isSignedIn && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      mutate();
    }
    if (!isSignedIn) {
      hasSyncedRef.current = false;
    }
  }, [isSignedIn, mutate]);
  return null;
};
