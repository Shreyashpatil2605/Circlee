import { useApiClient, userApi } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";

export const useFollowers = (userId: string | undefined) => {
  const api = useApiClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["followers", userId],
    queryFn: () => (userId ? userApi.getFollowers(api, userId) : null),
    enabled: !!userId,
  });

  return {
    followers: data?.data?.followers || [],
    isLoading,
    error,
    refetch,
  };
};

export const useFollowing = (userId: string | undefined) => {
  const api = useApiClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["following", userId],
    queryFn: () => (userId ? userApi.getFollowing(api, userId) : null),
    enabled: !!userId,
  });

  return {
    following: data?.data?.following || [],
    isLoading,
    error,
    refetch,
  };
};
