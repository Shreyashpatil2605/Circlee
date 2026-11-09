import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from "react-native";
import React, { useState, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { usePosts } from "@/hooks/usePosts";
import PostsList from "@/components/PostsList";
import { FollowListModal } from "@/components/FollowListModal";
import { useApiClient, userApi } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { useFollowUser } from "@/hooks/useFollowUser";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useConversations } from "@/hooks/useMessages";
import { modalService } from "@/context/ModalContext";
import { ProfileFloatingHeader } from "@/components/ProfileFloatingHeader";

const UserProfileScreen = () => {
  const { username } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, refetch: refetchCurrentUser } = useCurrentUser();
  const api = useApiClient();

  const [followersModalVisible, setFollowersModalVisible] = useState(false);
  const [followingModalVisible, setFollowingModalVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Fetch user profile
  console.log("BEFORE USEQUERY");
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
  console.log("AFTER USEQUERY");
  const user = profileData?.data?.user;
  console.log("PROFILE USER:", user);

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
      modalService.showAlert({
        title: "Cannot Message",
        description: "You can only message users who follow you and who you follow back.",
        icon: "lock",
        type: "warning",
        confirmText: "Got it",
        cancelText: "Cancel",
      });
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
      router.push("/(tabs)/messages");
      modalService.showToast("Conversation opened", "success");
    } catch (err) {
      console.log("CONVERSATION ERROR:", err);
      modalService.showToast("Failed to open conversation", "error");
    }
  };

  const handleFollow = async () => {
    if (!user) return;

    try {
      if (isFollowing) {
        modalService.showAlert({
          title: "Unfollow User?",
          description: `Are you sure you want to unfollow ${user.firstName} ${user.lastName}?`,
          icon: "user-minus",
          type: "danger",
          isDestructive: true,
          confirmText: "Unfollow",
          cancelText: "Cancel",
          onConfirm: async () => {
            await followUser(user._id);
            await refetchCurrentUser();
            await refetchProfile();
            modalService.showToast(`Unfollowed ${user.firstName}`, "info");
          },
        });
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
      <View className="flex-1 bg-dark-bg items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-dark-bg items-center justify-center px-6">
        <Text className="text-zinc-400 text-base font-medium">User not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 px-6 py-2.5 bg-neon-purple rounded-full"
          style={{
            shadowColor: "#8B5CF6",
            shadowOffset: { width: 0, height: 2 },
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
    <View className="flex-1 bg-dark-bg">
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Modern Transparent Floating Header */}
      <ProfileFloatingHeader
        user={user}
        postCount={userPosts.length}
        scrollY={scrollY}
        onBack={() => router.back()}
      />

      {/* ScrollView */}
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetchPosts()}
            tintColor="#8B5CF6"
          />
        }
      >
        {/* Banner Image with Top Scrim Gradient (Extends behind top navigation) */}
        <View style={{ width: "100%", height: 190 + insets.top, position: "relative" }}>
          <Image
            source={{
              uri:
                user.bannerImage ||
                "https://images.unsplash.com/photo-1506765515384-028b60a970df?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={[
              "rgba(11, 11, 16, 0.75)",
              "rgba(11, 11, 16, 0.35)",
              "transparent",
            ]}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: Math.max(insets.top + 70, 115),
            }}
            pointerEvents="none"
          />
        </View>

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
            <View className="mb-2">
              <Text className="text-gray-600">@{user.username}</Text>

              {user.isOnline ? (
                <Text className="text-green-500 text-sm font-medium">
                  ● Online
                </Text>
              ) : (
                <Text className="text-gray-500 text-sm">
                  Last seen {format(new Date(user.lastSeen), "MMM d, h:mm a")}
                </Text>
              )}
            </View>
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
      </Animated.ScrollView>

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
    </View>
  );
};

export default UserProfileScreen;
