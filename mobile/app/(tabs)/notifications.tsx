import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React from "react";
import { useNotifications } from "@/hooks/useNotifications";
import {
  SafeAreaView,
  useSafeAreaFrame,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import NoNotificationsFound from "@/components/NoNotificationsFound";
import { Notification } from "@/types";
import NotificationCard from "@/components/NotificationCard";

const NotificationScreen = () => {
  const {
    notifications,
    isLoading,
    error,
    refetch,
    isRefetching,
    deleteNotification,
  } = useNotifications();

  const insets = useSafeAreaInsets();

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-dark-bg">
        <Text className="text-text-tertiary mb-4">
          Failed to load Notifications
        </Text>
        <TouchableOpacity
          className="bg-accent-blue px-4 py-2 rounded-lg"
          onPress={() => refetch()}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={["top"]}>
      {/* header */}
      <BlurView
        intensity={70}
        tint="dark"
        className="flex-row items-center justify-between px-4 py-4 border-b border-border-glass-light"
      >
        <Text
          className="text-xl font-bold text-text-primary"
          style={{ textShadowColor: "#0A84FF", textShadowRadius: 10 }}
        >
          Notifications
        </Text>
        <TouchableOpacity>
          <Feather name="settings" size={24} color="#0A84FF" />
        </TouchableOpacity>
      </BlurView>
      {/* content */}
      <ScrollView
        className="flex-1 mt-2 bg-dark-bg"
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={"#0A84FF"}
          />
        }
      >
        {isLoading ? (
          <View className="flex-1  items-center justify-center p-8">
            <ActivityIndicator size="large" color="#0A84FF" />
            <Text className="text-text-tertiary mt-4">
              Loading notifications...
            </Text>
          </View>
        ) : notifications.length === 0 ? (
          <NoNotificationsFound />
        ) : (
          notifications.map((notification: Notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onDelete={deleteNotification}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationScreen;
