import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { BlurView } from "expo-blur";
import { usePosts } from "@/hooks/usePosts";
import PostsList from "@/components/PostsList";
import { FollowListModal } from "@/components/FollowListModal";
import { useApiClient, userApi } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { useFollowUser } from "@/hooks/useFollowUser";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useConversations } from "@/hooks/useMessages";

const UserProfileScreen = () => {
  const { username } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, refetch: refetchCurrentUser } = useCurrentUser();
  const api = useApiClient();

  const [followersModalVisible, setFollowersModalVisible] = useState(false);
  const [followingModalVisible, setFollowingModalVisible] = useState(false);

  // Fetch user profile
  const {
    data: profileData,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: () =>
      username
        ? userApi
            .getCurrentUser(api)
            .then(() => api.get(`/users/profile/${username}`))
        : null,
    enabled: !!username,
  });

  const user = profileData?.data?.user;

  const {
    posts: userPosts,
    refetch: refetchPosts,
    isLoading: isRefetching,
  } = usePosts(username as string);

  const { followUser, isFollowPending } = useFollowUser();
  const { getOrCreateConversation, isCreating: isCreatingConversation } =
    useConversations();

  const handleMessage = async () => {
    if (!user) return;

    console.log("===== MESSAGE BUTTON PRESSED =====");
    console.log("Current User:", currentUser);
    console.log("Target User:", user);

    const userFollowsCurrentUser =
      user?.followers?.some(
        (follower: any) =>
          follower._id?.toString() === currentUser?._id?.toString(),
      ) ?? false;

    const currentUserFollowsUser =
      currentUser?.following?.some(
        (followedUser: any) =>
          followedUser._id?.toString() === user?._id?.toString(),
      ) ?? false;

    console.log("userFollowsCurrentUser:", userFollowsCurrentUser);
    console.log("currentUserFollowsUser:", currentUserFollowsUser);

    if (!userFollowsCurrentUser || !currentUserFollowsUser) {
      Alert.alert(
        "Cannot Message",
        "You can only message users who follow you and who you follow back.",
      );
      return;
    }

    try {
      // IMPORTANT DEBUG LOGS
      console.log("Selected User:", JSON.stringify(user, null, 2));
      console.log("user._id:", user._id);
      console.log("user.clerkId:", user.clerkId);

      // Use Clerk ID if available
      const participantId = user.clerkId || user._id;

      console.log("Sending participantId:", participantId);

      const result = await getOrCreateConversation({
        participantId,
      });

      console.log("CONVERSATION CREATED:", JSON.stringify(result, null, 2));

      Alert.alert("Success", "Conversation created successfully");
    } catch (err) {
      console.log("CONVERSATION ERROR:", err);
      Alert.alert("Error", "Failed to create conversation");
    }
  };

  const handleFollow = async () => {
    if (!user) return;

    try {
      if (isFollowing) {
        Alert.alert(
          "Unfollow User",
          `Are you sure you want to unfollow ${user.firstName} ${user.lastName}?`,
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Unfollow",
              style: "destructive",
              onPress: async () => {
                await followUser(user._id);
                await refetchCurrentUser();
                await refetchProfile();
              },
            },
          ],
        );
      } else {
        await followUser(user._id);
        await refetchCurrentUser();
        await refetchProfile();
      }
    } catch (err) {
      console.log("FOLLOW ERROR:", err);
    }
  };

  const isOwnProfile = currentUser?._id === user?._id;
  const isFollowing =
    currentUser?.following?.some(
      (followedUser: any) =>
        followedUser._id?.toString() === user?._id?.toString(),
    ) ?? false;

  if (profileLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#9D00FF" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-600">User not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 px-6 py-2 bg-neon-purple rounded-full"
          style={{
            shadowColor: "#9D00FF",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 10,
          }}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-bg">
      {/* Header */}
      <BlurView
        intensity={20}
        tint="light"
        className="flex-row items-center px-4 py-3 border-b border-gray-200"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#9D00FF" />
        </TouchableOpacity>
        <View className="ml-4">
          <Text className="font-bold text-xl text-white">
            {user.firstName} {user.lastName}
          </Text>
          <Text className="text-gray-600 text-sm">
            {userPosts.length} Posts
          </Text>
        </View>
      </BlurView>

      {/* ScrollView */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetchPosts()}
            tintColor="#9D00FF"
          />
        }
      >
        {/* Banner Image */}
        <Image
          source={{
            uri:
              user.bannerImage ||
              "https://images.unsplash.com/photo-1506765515384-028b60a970df?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          }}
          className="w-full h-48"
          resizeMode="cover"
        />

        {/* Profile Section */}
        <View className="px-4 pb-4 border-b border-gray-200">
          <View className="flex-row justify-between items-end -mt-16 mb-4">
            <Image
              source={{ uri: user.profilePicture }}
              className="w-32 h-32 rounded-full border-4 border-white"
              style={{
                shadowColor: "#9D00FF",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 12,
              }}
            />
            {!isOwnProfile && (
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className={`px-6 py-2 rounded-full ${
                    isFollowing ? "border border-gray-300" : "bg-neon-purple"
                  }`}
                  style={
                    !isFollowing
                      ? {
                          shadowColor: "#9D00FF",
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.6,
                          shadowRadius: 10,
                        }
                      : {}
                  }
                  onPress={handleFollow}
                  disabled={isFollowPending}
                >
                  <Text
                    className={`font-semibold ${
                      isFollowing ? "text-white" : "text-white"
                    }`}
                  >
                    {isFollowPending
                      ? "..."
                      : isFollowing
                        ? "Following"
                        : "Follow"}
                  </Text>
                </TouchableOpacity>

                {/* Message Button - Only show if users mutually follow */}
                {isFollowing &&
                  user?.followers?.some(
                    (follower: any) =>
                      follower._id?.toString() === currentUser?._id?.toString(),
                  ) && (
                    <TouchableOpacity
                      className="px-6 py-2 rounded-full bg-neon-purple"
                      onPress={() => {
                        console.log("BUTTON CLICKED");
                        handleMessage();
                      }}
                      disabled={isCreatingConversation}
                    >
                      {isCreatingConversation ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Feather
                          name="message-circle"
                          size={20}
                          color="white"
                        />
                      )}
                    </TouchableOpacity>
                  )}
              </View>
            )}
          </View>

          {/* User Info */}
          <View className="mb-4">
            <View className="flex-row items-center mb-1">
              <Text className="font-bold text-xl mr-1 text-white">
                {user.firstName} {user.lastName}
              </Text>
              <Feather name="check-circle" size={20} color="#9D00FF" />
            </View>

            <Text className="text-gray-600 mb-2">@{user.username}</Text>
            <Text className="text-gray-700 mb-3">{user.bio}</Text>

            {user.location && (
              <View className="flex-row items-center mb-2">
                <Feather name="map-pin" size={16} color="#9D00FF" />
                <Text className="ml-2 text-gray-600">{user.location}</Text>
              </View>
            )}

            <View className="flex-row items-center mb-2">
              <Feather name="calendar" size={16} color="#9D00FF" />
              <Text className="ml-2 text-gray-600">
                Joined {format(new Date(user.createdAt), "MMMM yyyy")}
              </Text>
            </View>

            {/* Followers/Following */}
            <View className="flex-row">
              <TouchableOpacity
                className="mr-6"
                onPress={() => setFollowingModalVisible(true)}
              >
                <Text className="text-white">
                  <Text className="font-bold">
                    {user.following?.length || 0}
                  </Text>
                  <Text className="text-gray-600"> Following</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setFollowersModalVisible(true)}>
                <Text className="text-white">
                  <Text className="font-bold">
                    {user.followers?.length || 0}
                  </Text>
                  <Text className="text-gray-600"> Followers</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* User Posts */}
        <PostsList username={user.username} />
      </ScrollView>

      {/* Follow List Modals */}
      <FollowListModal
        visible={followersModalVisible}
        onClose={() => setFollowersModalVisible(false)}
        userId={user._id}
        type="followers"
      />
      <FollowListModal
        visible={followingModalVisible}
        onClose={() => setFollowingModalVisible(false)}
        userId={user._id}
        type="following"
      />
    </SafeAreaView>
  );
};

export default UserProfileScreen;
