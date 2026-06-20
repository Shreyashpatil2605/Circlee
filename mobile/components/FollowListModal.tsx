import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFollowers, useFollowing } from "@/hooks/useFollowersList";

interface FollowListModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string | undefined;
  type: "followers" | "following";
}

export const FollowListModal = ({
  visible,
  onClose,
  userId,
  type,
}: FollowListModalProps) => {
  const { followers, isLoading: followersLoading } = useFollowers(
    type === "followers" ? userId : undefined
  );

  const { following, isLoading: followingLoading } = useFollowing(
    type === "following" ? userId : undefined
  );

  const list = type === "followers" ? followers : following;
  const isLoading = type === "followers" ? followersLoading : followingLoading;

  const renderItem = ({ item }: { item: any }) => (
    <View className="mx-3 my-1 overflow-hidden rounded-2xl">
      <BlurView
        intensity={50}
        tint="dark"
        className="flex-row items-center justify-between px-4 py-3 border border-white/10"
      >
        <View className="flex-row items-center flex-1">
          <Image
            source={{ uri: item.profilePicture }}
            className="w-12 h-12 rounded-full mr-3"
          />

          <View>
            <Text className="font-semibold text-white text-base">
              {item.firstName} {item.lastName}
            </Text>

            <Text className="text-gray-400 text-sm">
              @{item.username}
            </Text>
          </View>
        </View>
      </BlurView>
    </View>
  );

  return (
    <Modal   visible={visible}
  animationType="slide"
  presentationStyle="fullScreen"
  statusBarTranslucent>
    <SafeAreaView
    className="flex-1 bg-[#0B1220]"
    edges={["top", "bottom"]}
  >
      <View className="flex-1 bg-[#0B1220]">
        {/* Header */}
        <BlurView
          intensity={70}
          tint="dark"
          className="flex-row items-center justify-between px-4 py-4 border-b border-white/10"
        >
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons
              name="close"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <Text className="text-lg font-bold text-white">
            {type === "followers" ? "Followers" : "Following"}
          </Text>

          <View style={{ width: 24 }} />
        </BlurView>

        {/* Content */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator
              size="large"
              color="#0A84FF"
            />
          </View>
        ) : list.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-400 text-base">
              No {type} yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={list}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{
              paddingTop: 10,
              paddingBottom: 40,
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      </SafeAreaView>
    </Modal>
  );
};