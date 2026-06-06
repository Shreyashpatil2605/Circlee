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
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { usePosts } from "@/hooks/usePosts";
import PostsList from "@/components/PostsList";
import { useProfile } from "@/hooks/useProfile";
import EditProfileModel from "@/components/EditProfileModel";
import { FollowListModal } from "@/components/FollowListModal";
import { BlurView } from "expo-blur";

const ProfileScreen = () => {
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
      <View className="flex-1 bg-dark-bg items-center justify-center">
        <ActivityIndicator size="large" color="#0A84FF"></ActivityIndicator>
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
        <View>
          <Text className="font-bold text-xl text-text-primary">
            {currentUser.firstName} {currentUser.lastName}
          </Text>
          <Text className="text-text-tertiary text-sm">
            {userPosts.length} Posts
          </Text>
        </View>
        <SignOutButton />
      </BlurView>

      {/* ScrollView */}
      <ScrollView
        className="flex-1 bg-dark-bg"
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

        {/* profilePicture */}
        <View className="px-4 pb-4 border-b border-border-glass-light">
          <View className="flex-row justify-between items-end -mt-16 mb-4">
            <Image
              source={{ uri: currentUser.profilePicture }}
              className="w-32 h-32 rounded-full border-4 border-accent-blue"
              style={{
                shadowColor: "#0A84FF",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 12,
              }}
            />
            <TouchableOpacity
              className="border border-accent-blue px-6 py-2 rounded-full"
              style={{
                shadowColor: "#0A84FF",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
              }}
              onPress={openEditModel}
            >
              <Text className="font-semibold text-accent-blue">
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* currentUser.firstName // currentUser.lastName */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Text className="font-bold text-xl mr-2 text-text-primary">
                {currentUser.firstName} {currentUser.lastName}
              </Text>
              <Feather name="check-circle" size={20} color="#0A84FF" />
            </View>

            {/* {currentUser.username} */}
            <Text className="text-text-tertiary mb-2">
              @{currentUser.username}
            </Text>
            <Text className="text-text-secondary mb-3">{currentUser.bio}</Text>

            {/* location */}
            <View className="flex-row items-center mb-2">
              <Feather name="map-pin" size={16} color="#0A84FF" />
              <Text className="ml-2 text-text-tertiary">
                {currentUser.location}
              </Text>
            </View>

            {/* createdAt */}
            <View className="flex-row items-center mb-3">
              <Feather name="calendar" size={16} color="#0A84FF" />
              <Text className="ml-2 text-text-tertiary">
                {" "}
                Joined {format(new Date(currentUser.createdAt), "MMMM yyyy")}
              </Text>
            </View>

            {/* following */}
            <View className="flex-row">
              <TouchableOpacity
                className="mr-6"
                onPress={() => setFollowingModalVisible(true)}
              >
                <Text className="text-text-secondary">
                  <Text className="font-bold text-text-primary">
                    {currentUser.following?.length || 0}
                  </Text>
                  <Text className="text-text-tertiary"> Following</Text>
                </Text>
              </TouchableOpacity>

              {/* followers */}
              <TouchableOpacity onPress={() => setFollowersModalVisible(true)}>
                <Text className="text-text-secondary">
                  <Text className="font-bold text-text-primary">
                    {currentUser.followers?.length || 0}
                  </Text>
                  <Text className="text-text-tertiary"> Followers</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
