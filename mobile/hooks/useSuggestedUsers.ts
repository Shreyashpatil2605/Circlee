import { useMemo } from "react";
import { useApiClient, userApi } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "./useCurrentUser";

export interface SuggestedUser {
  _id?: string;
  clerkId?: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  bio?: string;
  followers?: any[];
  following?: any[];
}

export const useSuggestedUsers = () => {
  const api = useApiClient();
  const { currentUser } = useCurrentUser();

  // Fetch suggested users from MongoDB REST API
  const {
    data: apiUsers = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["suggestedUsers", currentUser?._id],
    queryFn: async () => {
      try {
        const res = await userApi.getSuggestedUsers(api);
        return (res.data?.users as SuggestedUser[]) || [];
      } catch (err) {
        console.log("Could not fetch suggested users from REST API:", err);
        return [];
      }
    },
    staleTime: 1000 * 45,
  });

  const users = useMemo(() => {
    if (!apiUsers || !Array.isArray(apiUsers)) return [];
    return apiUsers.filter(
      (u) =>
        u.clerkId !== currentUser?.clerkId &&
        u._id?.toString() !== currentUser?._id?.toString()
    );
  }, [apiUsers, currentUser]);

  return {
    users,
    isLoading,
    refetch,
  };
};

export default useSuggestedUsers;
