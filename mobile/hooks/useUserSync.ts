import { useApiClient, userApi } from "@/utils/api";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

export const useUserSync = () => {
  const { isSignedIn } = useAuth();
  const api = useApiClient();

  const syncUserMutation = useMutation({
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
  //AutoSync user When signed in
  useEffect(() => {
    //if user is signed in and user is not synced in sync user
    // the below line means save the user in the database if it is not saved
    if (isSignedIn && !syncUserMutation.data) {
      syncUserMutation.mutate();
    }
  }, [isSignedIn]);
  return null;
};
