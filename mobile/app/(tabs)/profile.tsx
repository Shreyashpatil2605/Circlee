import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import SignOutButton from "@/components/SignOutButton";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { format } from "date-fns";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { usePosts } from "@/hooks/usePosts";
import PostsList from "@/components/PostsList";
import { useProfile } from "@/hooks/useProfile";
import EditProfileModel from "@/components/EditProfileModel";
import { FollowListModal } from "@/components/FollowListModal";
import ScreenHeader from "@/components/ui/ScreenHeader";
import Avatar from "@/components/ui/Avatar";

const ProfileScreen = () => {
  const router = useRouter();
  const { currentUser, isLoading } = useCurrentUser();
  const insets = useSafeAreaInsets();
  const [followersModalVisible, setFollowersModalVisible] = useState(false);
  const [followingModalVisible, setFollowingModalVisible] = useState(false);

  const {
    posts: userPosts,
    refetch: refetchPosts,
    isLoading: isRefetching,
  } = usePosts(currentUser?.username);

  const {
    isEditModelVisible,
    formData,
    openEditModel,
    closeEditModel,
    saveProfile,
    updateFormField,
    isUpdating,
    refetch: refetchProfile,
    pickImage,
  } = useProfile();

  if (isLoading) {
    return (
      <View className="flex-1 bg-chat-bg items-center justify-center">
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  const savedPostsCount = Array.isArray(currentUser?.savedPosts)
    ? currentUser.savedPosts.length
    : 0;

  return (
    <SafeAreaView className="flex-1 bg-chat-bg" edges={["top"]}>
      {/* header */}
      <ScreenHeader
        title=""
        leftSlot={
          <View>
            <Text className="font-bold text-xl text-white">
              {currentUser.firstName} {currentUser.lastName}
            </Text>
            <Text className="text-zinc-500 text-xs mt-0.5">
              {userPosts.length} Posts
            </Text>
          </View>
        }
        rightSlot={<SignOutButton />}
      />

      {/* ScrollView */}
      <ScrollView
        className="flex-1 bg-chat-bg"
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetchProfile();
              refetchPosts();
            }}
            tintColor="#0A84FF"
          />
        }
      >
        {/* bannerImage */}
        <Image
          source={{
            uri:
              currentUser.bannerImage ||
              "https://images.unsplash.com/photo-1506765515384-028b60a970df?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          }}
          className="w-full h-48"
          resizeMode="cover"
        />

        {/* profilePicture & actions */}
        <View className="px-4 pb-4 border-b border-border-glass-light">
          <View className="flex-row justify-between items-end -mt-14 mb-4">
            <Avatar
              uri={currentUser.profilePicture}
              size={112}
              borderClassName="border-4 border-accent-blue"
              className="-mt-14"
            />
            <TouchableOpacity
              className="border border-accent-blue px-6 py-2 rounded-full"
              style={{
                shadowColor: "#0A84FF",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 2,
              }}
              onPress={openEditModel}
            >
              <Text className="font-semibold text-accent-blue text-sm">
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* currentUser.firstName // currentUser.lastName */}
          <View className="mb-4">
            <View className="flex-row items-center mb-1">
              <Text className="font-bold text-xl mr-2 text-white">
                {currentUser.firstName} {currentUser.lastName}
              </Text>
              <Feather name="check-circle" size={18} color="#0A84FF" />
            </View>

            {/* {currentUser.username} */}
            <Text className="text-zinc-500 text-sm mb-2">
              @{currentUser.username}
            </Text>
            <Text className="text-chat-text-secondary text-sm leading-relaxed mb-3">
              {currentUser.bio}
            </Text>

            {/* location */}
            <View className="flex-row items-center mb-1.5">
              <Feather
                name="map-pin"
                size={14}
                color="#0A84FF"
                style={{ marginRight: 6 }}
              />
              <Text className="text-zinc-500 text-xs">
                {currentUser.location}
              </Text>
            </View>

            {/* createdAt */}
            <View className="flex-row items-center mb-4.5">
              <Feather
                name="calendar"
                size={14}
                color="#0A84FF"
                style={{ marginRight: 6 }}
              />
              <Text className="text-zinc-500 text-xs">
                Joined {format(new Date(currentUser.createdAt), "MMMM yyyy")}
              </Text>
            </View>

            {/* following & followers counts */}
            <View className="flex-row mt-3">
              <TouchableOpacity
                className="mr-6"
                onPress={() => setFollowingModalVisible(true)}
              >
                <Text className="text-chat-text-secondary text-sm">
                  <Text className="font-bold text-white">
                    {currentUser.following?.length || 0}
                  </Text>
                  <Text className="text-zinc-500"> Following</Text>
                </Text>
              </TouchableOpacity>

              {/* followers */}
              <TouchableOpacity onPress={() => setFollowersModalVisible(true)}>
                <Text className="text-chat-text-secondary text-sm">
                  <Text className="font-bold text-white">
                    {currentUser.followers?.length || 0}
                  </Text>
                  <Text className="text-zinc-500"> Followers</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Saved Posts Shortcut */}
        <View className="px-4 py-3 border-b border-border-glass-light">
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/saved-posts");
            }}
            className="flex-row items-center justify-between bg-[#14141C] border border-[#272733] rounded-2xl p-3.5"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 items-center justify-center mr-3 border border-[#8B5CF6]/30">
                <FontAwesome name="bookmark" size={17} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  Saved Posts
                </Text>
                <Text className="text-zinc-400 text-xs mt-0.5">
                  {savedPostsCount === 1
                    ? "1 saved post"
                    : `${savedPostsCount} saved posts`}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="bg-[#1B1B25] border border-[#272733] px-2.5 py-1 rounded-full mr-2">
                <Text className="text-zinc-300 font-semibold text-xs">
                  {savedPostsCount}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#71717A" />
            </View>
          </TouchableOpacity>
        </View>

        <PostsList username={currentUser?.username} />
      </ScrollView>
      <EditProfileModel
        isVisible={isEditModelVisible}
        onClose={closeEditModel}
        formData={formData}
        saveProfile={saveProfile}
        updateFormField={updateFormField}
        isUpdating={isUpdating}
        pickImage={pickImage}
      />

      {/* Follow List Modals */}
      <FollowListModal
        visible={followersModalVisible}
        onClose={() => setFollowersModalVisible(false)}
        userId={currentUser?._id}
        type="followers"
      />
      <FollowListModal
        visible={followingModalVisible}
        onClose={() => setFollowingModalVisible(false)}
        userId={currentUser?._id}
        type="following"
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;
