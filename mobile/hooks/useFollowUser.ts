import { useApiClient, userApi } from "@/utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useFollowUser = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      console.log("Following user:", targetUserId);
      return userApi.followUser(api, targetUserId);
    },
    onSuccess: (data: any, targetUserId: string) => {
      console.log("Follow success:", data.data);
      
      const isNowFollowing = !data.data.isFollowing; // true if now following, false if unfollowed
      
      // Invalidate instead of manual cache patching to avoid shape/type mismatches
      // and ensure real-time consistency when navigating back.
      // data?.data?.user is the current authenticated user (per your API logging).
      const currentUserId = data?.data?.user?._id;

      // Re-fetch target user's follower/following lists
      queryClient.invalidateQueries({ queryKey: ["followers", targetUserId], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["following", targetUserId], refetchType: "all" });

      // Re-fetch current user's following list (so the Follow button updates)
      if (currentUserId) {
        queryClient.invalidateQueries({ queryKey: ["following", currentUserId], refetchType: "all" });
      }

      // Re-fetch current auth user
      queryClient.invalidateQueries({ queryKey: ["authUser"], refetchType: "all" });

      // Also refetch profile query if it's mounted
    },
    onError: (error: any) => {
      console.log("Follow error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      Alert.alert(
        "Error",
        error.response?.data?.message || error.message || "Failed to follow user",
      );
    },
  });

  return {
    followUser: (targetUserId: string) => followMutation.mutate(targetUserId),
    isFollowPending: followMutation.isPending,
    isFollowError: followMutation.isError,
  };
};
