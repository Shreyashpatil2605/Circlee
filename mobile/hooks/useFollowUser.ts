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
      
      // Update followers list cache for the target user
      queryClient.setQueryData(
        ["followers", targetUserId],
        (oldData: any) => {
          if (!oldData) return oldData;
          if (isNowFollowing) {
            // Add current user to followers list
            return {
              ...oldData,
              data: {
                ...oldData.data,
                followers: [
                  ...(oldData.data?.followers || []),
                  data.data.user, // Add current user
                ],
              },
            };
          } else {
            // Remove current user from followers list
            return {
              ...oldData,
              data: {
                ...oldData.data,
                followers: (oldData.data?.followers || []).filter(
                  (f: any) => f._id !== data.data.user._id,
                ),
              },
            };
          }
        }
      );

      // Update following list cache for current user
      queryClient.setQueryData(
        ["following", data.data.user._id],
        (oldData: any) => {
          if (!oldData) return oldData;
          if (isNowFollowing) {
            // Add target user to following list
            return {
              ...oldData,
              data: {
                ...oldData.data,
                following: [
                  ...(oldData.data?.following || []),
                  { _id: targetUserId }, // Add target user
                ],
              },
            };
          } else {
            // Remove target user from following list
            return {
              ...oldData,
              data: {
                ...oldData.data,
                following: (oldData.data?.following || []).filter(
                  (f: any) => f._id !== targetUserId,
                ),
              },
            };
          }
        }
      );

      // Invalidate queries to fetch latest data
      queryClient.invalidateQueries({ queryKey: ["authUser"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["userProfile"], refetchType: "all" });
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
