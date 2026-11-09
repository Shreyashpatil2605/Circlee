import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from "react-native";
import React, { useState, useCallback, useMemo } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import NoNotificationsFound from "@/components/NoNotificationsFound";
import { Notification, NotificationType } from "@/types";
import NotificationCard from "@/components/NotificationCard";
import { NotificationSkeletonList } from "@/components/NotificationSkeleton";
import { isToday, isYesterday } from "date-fns";
import * as Haptics from "expo-haptics";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import ScreenHeader from "@/components/ui/ScreenHeader";

const NotificationScreen = () => {
  const {
    notifications,
    isLoading,
    error,
    refetch,
    isRefetching,
    deleteNotification,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<"all" | NotificationType>("all");
  const insets = useSafeAreaInsets();

  const filterPills = useMemo(() => [
    { label: "All", value: "all" as const },
    { label: "Follows", value: NotificationType.FOLLOW },
  ], []);

  const handleFilterChange = useCallback((filter: "all" | NotificationType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(filter);
  }, []);

  const handleNotificationPress = useCallback((notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    switch (notification.targetType) {
      case "Post":
        router.push({
          pathname: "/",
          params: { openPostCommentsId: notification.targetId },
        });
        break;
      case "Comment":
        if (notification.post) {
          router.push({
            pathname: "/",
            params: {
              openPostCommentsId: notification.post._id,
              highlightCommentId: notification.targetId,
            },
          });
        }
        break;
      case "Profile":
        router.push({
          pathname: "/[username]",
          params: { username: notification.targetId },
        });
        break;
      case "Conversation":
        router.push({
          pathname: "/messages",
          params: {
            senderClerkId: notification.from.clerkId,
            conversationId: notification.targetId,
            messageId: notification.messageId,
          },
        });
        break;
      default:
        console.warn("Unknown targetType:", notification.targetType);
        break;
    }
  }, [markAsRead]);

  const handleDeleteNotification = useCallback((id: string) => {
    deleteNotification(id);
  }, [deleteNotification]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif: Notification) => {
      if (activeFilter === "all") return true;
      return notif.type === activeFilter;
    });
  }, [notifications, activeFilter]);

  // Group and flatten notifications for FlatList
  const flatListData = useMemo(() => {
    const todayList: Notification[] = [];
    const yesterdayList: Notification[] = [];
    const thisWeekList: Notification[] = [];
    const earlierList: Notification[] = [];

    const now = new Date();

    filteredNotifications.forEach((notif: Notification) => {
      const date = new Date(notif.createdAt);
      if (isToday(date)) {
        todayList.push(notif);
      } else if (isYesterday(date)) {
        yesterdayList.push(notif);
      } else {
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          thisWeekList.push(notif);
        } else {
          earlierList.push(notif);
        }
      }
    });

    const listData: any[] = [];
    let indexTracker = 0;

    if (todayList.length > 0) {
      listData.push({ type: "header", title: "Today" });
      todayList.forEach((item) => {
        listData.push({ type: "notification", data: item, index: indexTracker++ });
      });
    }
    if (yesterdayList.length > 0) {
      listData.push({ type: "header", title: "Yesterday" });
      yesterdayList.forEach((item) => {
        listData.push({ type: "notification", data: item, index: indexTracker++ });
      });
    }
    if (thisWeekList.length > 0) {
      listData.push({ type: "header", title: "This Week" });
      thisWeekList.forEach((item) => {
        listData.push({ type: "notification", data: item, index: indexTracker++ });
      });
    }
    if (earlierList.length > 0) {
      listData.push({ type: "header", title: "Earlier" });
      earlierList.forEach((item) => {
        listData.push({ type: "notification", data: item, index: indexTracker++ });
      });
    }

    return listData;
  }, [filteredNotifications]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    if (item.type === "header") {
      return (
        <View className="flex-row items-center px-5 py-2.5 mt-2 mb-1">
          <Text className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
            {item.title}
          </Text>
          <View className="flex-1 h-[1px] bg-white/5 ml-3.5" />
        </View>
      );
    }

    return (
      <NotificationCard
        notification={item.data}
        onDelete={handleDeleteNotification}
        onPress={handleNotificationPress}
        index={item.index}
      />
    );
  }, [handleDeleteNotification, handleNotificationPress]);

  const keyExtractor = useCallback((item: any) => {
    return item.type === "header"
      ? `header-${item.title}`
      : `notif-${item.data._id}`;
  }, []);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0B0B12] px-6">
        <View className="w-12 h-12 rounded-full bg-red-500/10 items-center justify-center mb-4">
          <Feather name="alert-triangle" size={22} color="#FF3B30" />
        </View>
        <Text className="text-zinc-400 text-sm mb-5 text-center font-medium">
          Failed to load Notifications
        </Text>
        <TouchableOpacity
          className="bg-[#6B4EFF] px-6 py-2.5 rounded-full active:bg-[#5A3EE0]"
          onPress={() => refetch()}
        >
          <Text className="text-white font-bold text-sm">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-[#0B0B12]" edges={["top"]}>
        {/* Background radial ambient glow */}
        <View className="absolute inset-0 bg-[#0B0B12] -z-10">
          <LinearGradient
            colors={["rgba(107, 78, 255, 0.08)", "rgba(11, 11, 18, 0)"]}
            className="absolute top-0 right-0 w-80 h-80 rounded-full"
            start={{ x: 0.5, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <LinearGradient
            colors={["rgba(10, 132, 255, 0.04)", "rgba(11, 11, 18, 0)"]}
            className="absolute bottom-0 left-0 w-96 h-96 rounded-full"
            start={{ x: 0, y: 1 }}
            end={{ x: 0.5, y: 0 }}
          />
        </View>

        {/* Custom Header */}
        <ScreenHeader
          title="Activity"
          rightSlot={
            <TouchableOpacity
              className="flex-row items-center bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full active:bg-white/10"
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                markAllAsRead();
              }}
            >
              <Feather name="check-square" size={14} color="#A7A7B5" style={{ marginRight: 6 }} />
              <Text className="text-zinc-400 text-xs font-bold">Mark all read</Text>
            </TouchableOpacity>
          }
        />

        {/* Filters Pill Bar */}
        <View className="flex-row gap-2 px-4 py-3 bg-transparent">
          {filterPills.map((pill) => {
            const isActive = activeFilter === pill.value;
            return (
              <TouchableOpacity
                key={pill.value}
                onPress={() => handleFilterChange(pill.value)}
                className={`px-5 py-2 rounded-full border ${
                  isActive
                    ? "bg-accent-blue border-accent-blue"
                    : "bg-white/5 border-white/5"
                }`}
                activeOpacity={0.8}
              >
                <Text
                  className={`text-xs font-bold ${
                    isActive ? "text-white" : "text-zinc-400"
                  }`}
                >
                  {pill.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content stream */}
        {isLoading ? (
          <NotificationSkeletonList />
        ) : filteredNotifications.length === 0 ? (
          <NoNotificationsFound />
        ) : (
          <FlatList
            data={flatListData}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={"#6B4EFF"}
                colors={["#6B4EFF"]}
              />
            }
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default NotificationScreen;
