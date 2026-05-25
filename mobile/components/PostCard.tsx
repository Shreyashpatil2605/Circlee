import { View, Text, Alert, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Post, User } from "@/types";
import { formatDate, formatNumber } from "@/utils/formatters";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";

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
    <View className="mb-2 mx-2 rounded-2xl overflow-hidden border border-white/10">
      <BlurView intensity={30} tint="dark" className="flex-row p-4">
        <TouchableOpacity onPress={handleUserPress}>
          <Image
            source={{ uri: post.user.profilePicture || "" }}
            className="w-12 h-12 rounded-full mr-3 border border-neon-purple/50"
          />
        </TouchableOpacity>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <TouchableOpacity
              className="flex-row items-center flex-1"
              onPress={handleUserPress}
            >
              <Text className="font-bold text-white mr-1">
                {post.user.firstName} {post.user.lastName}
              </Text>
              <Text className="text-gray-400 mr-1">@{post.user.username}</Text>
              <Text className="font-bold text-gray-500 ml-5">
                .{formatDate(post.createdAt)}
              </Text>
            </TouchableOpacity>
            {isOwnPost && (
              <TouchableOpacity onPress={handleDelete}>
                <Feather name="trash" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
          {post.content && (
            <Text className="text-gray-300 text-base leading-5 mb-3">
              {post.content}
            </Text>
          )}

          {post.image && (
            <Image
              source={{ uri: post.image }}
              className="w-full h-48 rounded-2xl mb-3 border border-white/5"
              resizeMode="cover"
            />
          )}

          {/* Actions */}
          <View className="flex-row justify-between max-w-xs mt-2">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => onComment(post)}
            >
              <Feather name="message-circle" size={18} color="#A0AEC0" />
              <Text className="text-gray-400 text-sm ml-2">
                {formatNumber(post.comments?.length || 0)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center">
              <Feather name="repeat" size={17} color="#A0AEC0" />
              <Text className="text-gray-400 ml-2 text-sm">0</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => onLike(post._id)}
            >
              {isLiked ? (
                <AntDesign name="heart" size={18} color="#9D00FF" style={{ textShadowColor: '#9D00FF', textShadowRadius: 8 }} />
              ) : (
                <Feather name="heart" size={18} color="#A0AEC0" />
              )}
              <Text
                className={`text-sm ml-2 ${isLiked ? "text-neon-purple font-bold" : "text-gray-400"}`}
                style={isLiked ? { textShadowColor: '#9D00FF', textShadowRadius: 10 } : {}}
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
