import { View, Text, Alert, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Post, User } from "@/types";
import { formatDate, formatNumber } from "@/utils/formatters";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import GlassCard from "@/components/ui/GlassCard";
import Avatar from "@/components/ui/Avatar";

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
    <View className="mb-3 mx-3">
      <GlassCard className="flex-row p-4">
        <TouchableOpacity onPress={handleUserPress}>
          <Avatar
            uri={post.user.profilePicture}
            size={48}
            className="mr-3"
            borderClassName="border border-accent-blue/30"
          />
        </TouchableOpacity>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <TouchableOpacity
              className="flex-row items-center flex-1"
              onPress={handleUserPress}
            >
              <Text className="font-bold text-white mr-1 text-[15px]">
                {post.user.firstName} {post.user.lastName}
              </Text>
              <Text className="text-zinc-500 text-xs mr-1">
                @{post.user.username}
              </Text>
              <Text className="text-zinc-500 text-xs ml-4">
                · {formatDate(post.createdAt)}
              </Text>
            </TouchableOpacity>
            {isOwnPost && (
              <TouchableOpacity onPress={handleDelete} className="p-1">
                <Feather name="trash" size={16} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          {post.content && (
            <Text className="text-chat-text-secondary text-sm leading-relaxed mb-3">
              {post.content}
            </Text>
          )}

          {post.image && (
            <Image
              source={{ uri: post.image }}
              className="w-full rounded-2xl mb-3 border border-border-glass-light"
              style={{
                aspectRatio: 4 / 5,
              }}
              resizeMode="cover"
            />
          )}

          {/* Actions */}
          <View className="flex-row justify-between max-w-xs mt-2.5">
            <TouchableOpacity
              className="flex-row items-center p-1"
              onPress={() => onComment(post)}
            >
              <Feather name="message-circle" size={18} color="#A7A7B5" />
              <Text className="text-zinc-500 text-xs ml-2">
                {formatNumber(post.comments?.length || 0)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-1">
              <Feather name="repeat" size={17} color="#A7A7B5" />
              <Text className="text-zinc-500 text-xs ml-2">0</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-1"
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
                <Feather name="heart" size={18} color="#A7A7B5" />
              )}
              <Text
                className={`text-xs ml-2 ${isLiked ? "text-accent-blue font-bold" : "text-zinc-500"}`}
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
      </GlassCard>
    </View>
  );
};

export default PostCard;
