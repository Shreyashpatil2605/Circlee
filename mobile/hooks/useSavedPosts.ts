import { postApi, useApiClient } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { Post } from "@/types";

export const useSavedPosts = () => {
  const api = useApiClient();

  const {
    data: savedPosts,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["savedPosts"],
    queryFn: () => postApi.getSavedPosts(api),
    select: (response) => (response.data.posts as Post[]) || [],
  });

  return {
    savedPosts: savedPosts || [],
    isLoading,
    isRefetching,
    error,
    refetch,
  };
};
