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
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600 mb-4">Failed to load Notifications</Text>
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => refetch()}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* header */}
      <BlurView intensity={20} tint="light" className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Text className="text-xl font-bold text-black" style={{ textShadowColor: '#9D00FF', textShadowRadius: 10 }}>Notifications</Text>
        <TouchableOpacity>
          <Feather name="settings" size={24} color="#9D00FF" />
        </TouchableOpacity>
      </BlurView>
      {/* content */}
      {/* contentContainerStyle={{ paddingBottom: 100 + insets.bottom} adds extra bottom spacing inside a scrollable container. Usually used with: ScrollView, FlatList in React Native */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        // Add the loading scrteen at the top of the screem so that we can get the refresh like thing....
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={"#1DA1F2"}
          />
        }
      >
        {isLoading ? (
          <View className="flex-1  items-center justify-center p-8">
            <ActivityIndicator size="large" color="#9D00FF" />
            <Text className="text-gray-600 mt-4">Loading notifications...</Text>
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
