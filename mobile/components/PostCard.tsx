import { View, Text, Alert, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Post, User } from "@/types";
import { formatDate, formatNumber } from "@/utils/formatters";
import { AntDesign, Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onComment: (post: Post) => void;
  isLiked: boolean;
  currentUser: User;
}
const PostCard = ({
  currentUser,
  isLiked,
  onLike,
  onDelete,
  onComment,
  post,
}: PostCardProps) => {
  const router = useRouter();
  const isOwnPost = post.user._id === currentUser._id;

  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete the post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(post._id),
      },
    ]);
  };

  const handleUserPress = () => {
    if (post.user.username === currentUser.username) {
      router.push("/(tabs)/profile");
    } else {
      router.push(`/${post.user.username}`);
    }
  };

  return (
    <View className="mb-3 mx-3 rounded-2xl overflow-hidden border border-border-glass-light">
      <BlurView intensity={35} tint="dark" className="flex-row p-4">
        <TouchableOpacity onPress={handleUserPress}>
          <Image
            source={{ uri: post.user.profilePicture || "" }}
            className="w-12 h-12 rounded-full mr-3 border border-accent-blue/30"
          />
        </TouchableOpacity>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <TouchableOpacity
              className="flex-row items-center flex-1"
              onPress={handleUserPress}
            >
              <Text className="font-bold text-text-primary mr-1">
                {post.user.firstName} {post.user.lastName}
              </Text>
              <Text className="text-text-tertiary mr-1">
                @{post.user.username}
              </Text>
              <Text className="font-bold text-text-tertiary ml-5">
                .{formatDate(post.createdAt)}
              </Text>
            </TouchableOpacity>
            {isOwnPost && (
              <TouchableOpacity onPress={handleDelete}>
                <Feather name="trash" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          {post.content && (
            <Text className="text-text-secondary text-base leading-5 mb-3">
              {post.content}
            </Text>
          )}

          {post.image && (
            <Image
              source={{ uri: post.image }}
              className="w-full h-48 rounded-xl mb-3 border border-border-glass-medium"
              resizeMode="cover"
            />
          )}

          {/* Actions */}
          <View className="flex-row justify-between max-w-xs mt-3">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => onComment(post)}
            >
              <Feather name="message-circle" size={18} color="#9CA3AF" />
              <Text className="text-text-tertiary text-sm ml-2">
                {formatNumber(post.comments?.length || 0)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center">
              <Feather name="repeat" size={17} color="#9CA3AF" />
              <Text className="text-text-tertiary ml-2 text-sm">0</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => onLike(post._id)}
            >
              {isLiked ? (
                <AntDesign
                  name="heart"
                  size={18}
                  color="#0A84FF"
                  style={{ textShadowColor: "#0A84FF", textShadowRadius: 8 }}
                />
              ) : (
                <Feather name="heart" size={18} color="#9CA3AF" />
              )}
              <Text
                className={`text-sm ml-2 ${isLiked ? "text-accent-blue font-bold" : "text-text-tertiary"}`}
                style={
                  isLiked
                    ? { textShadowColor: "#0A84FF", textShadowRadius: 10 }
                    : {}
                }
              >
                {formatNumber(post.likes?.length || 0)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

export default PostCard;
