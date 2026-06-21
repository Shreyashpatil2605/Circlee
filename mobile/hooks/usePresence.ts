import { useApiClient, userApi } from "@/utils/api";
import { useMutation } from "@tanstack/react-query";

export const usePresence = () => {
  const api = useApiClient();

  const presenceMutation = useMutation({
    mutationFn: async (isOnline: boolean) => {
      return userApi.updatePresence(api, isOnline);
    },
  });

  return {
    updatePresence: (isOnline: boolean) =>
      presenceMutation.mutate(isOnline),

    updatePresenceAsync: (isOnline: boolean) =>
      presenceMutation.mutateAsync(isOnline),
  };
};