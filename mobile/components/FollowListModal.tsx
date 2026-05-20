import React, { useState } from "react";
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
    type === "followers" ? userId : undefined,
  );
  const { following, isLoading: followingLoading } = useFollowing(
    type === "following" ? userId : undefined,
  );

  const list = type === "followers" ? followers : following;
  const isLoading = type === "followers" ? followersLoading : followingLoading;

  const renderItem = ({ item }: { item: any }) => (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
      <View className="flex-row items-center flex-1">
        <Image
          source={{ uri: item.profilePicture }}
          className="w-12 h-12 rounded-full mr-3"
        />
        <View>
          <Text className="font-semibold text-gray-900">
            {item.firstName} {item.lastName}
          </Text>
          <Text className="text-sm text-gray-500">@{item.username}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">
            {type === "followers" ? "Followers" : "Following"}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#1DA1F2" />
          </View>
        ) : list.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">
              No {type} yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={list}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={true}
          />
        )}
      </View>
    </Modal>
  );
};
