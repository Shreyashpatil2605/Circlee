import { useApiClient } from "@/utils/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useNotifications = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get("/notifications"),
    select: (res) => res.data.notifications,
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) =>
      api.delete(`/notifications/${notificationId}`),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousNotifications = queryClient.getQueryData(["notifications"]);

      queryClient.setQueryData(["notifications"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            notifications: old.data.notifications.filter(
              (n: any) => n._id !== notificationId
            ),
          },
        };
      });

      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      api.put(`/notifications/${notificationId}/read`),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousNotifications = queryClient.getQueryData(["notifications"]);

      queryClient.setQueryData(["notifications"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            notifications: old.data.notifications.map((n: any) =>
              n._id === notificationId ? { ...n, read: true } : n
            ),
          },
        };
      });

      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: () => api.put("/notifications/read-all"),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousNotifications = queryClient.getQueryData(["notifications"]);

      queryClient.setQueryData(["notifications"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            notifications: old.data.notifications.map((n: any) => ({
              ...n,
              read: true,
            })),
          },
        };
      });

      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteNotification = (notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const markAsRead = (notificationId: string) => {
    markNotificationReadMutation.mutate(notificationId);
  };

  const markAllAsRead = () => {
    markAllNotificationsReadMutation.mutate();
  };

  return {
    notifications: notificationsData || [],
    isLoading,
    error,
    refetch,
    isRefetching,
    deleteNotification,
    markAsRead,
    markAllAsRead,
    isDeleteNotification: deleteNotificationMutation.isPending,
  };
};
