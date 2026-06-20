import { useApiClient } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";

export const useSearchUsers = (query: string) => {
  const api = useApiClient();

  const { data, isLoading } = useQuery({
    queryKey: ["searchUsers", query],
    queryFn: async () => {
      const res = await api.get(
        `/users/search?q=${encodeURIComponent(query)}`
      );

      return res.data.users;
    },
    enabled: query.trim().length > 0,
  });

  return {
    users: data || [],
    isLoading,
  };
};