import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import { Post } from "@/types";
import PostCard from "./PostCard";
import CommentsModal from "./CommentsModal";

const PostsList = ({username}:{username?:string}) => {
  const { currentUser, isLoading: isUserLoading } = useCurrentUser();
  const {
    posts,
    isLoading,
    error,
    refetch,
    toggleLike,
    deletePost,
    checkIsLiked,
  } = usePosts(username);


  const [selectedPostId, setSelectedPostId]= useState<string | null>(null)
  const selectedPost = selectedPostId ? posts.find((p:Post) => p._id===selectedPostId):null

  if (isLoading || isUserLoading) {
    return (
      <View className="p-8 items-center">
        <ActivityIndicator size="large" color="#9D00FF" />
        <Text className="text-gray-400 mt-5">Loading Posts....</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="p-8 items-center">
        <Text className="text-gray-400 mb-4">Failed to load Posts</Text>
        <TouchableOpacity
          className="bg-neon-purple px-4 py-2 rounded-lg"
          onPress={() => refetch()}
        >
          <Text className="text-white font-semibold"> Retry </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View className="p-8 items-center">
        <ActivityIndicator size="large" color="#9D00FF" />
        <Text className="text-gray-400 mt-5">Loading user...</Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View className="p-8 items-center">
        <Text className="text-gray-400"> No Posts Yet...</Text>
      </View>
    );
  }

  return (
    <>
      {posts.map((post: Post) => (
        <PostCard
          key={post._id}
          post={post}
          onLike={toggleLike}
          onDelete={deletePost}
          onComment = {(post:Post)=>setSelectedPostId(post._id)}
          currentUser={currentUser}
          isLiked={checkIsLiked(post.likes, currentUser)}
        />
      ))}
      <CommentsModal selectedPost={selectedPost}  onClose= {()=> setSelectedPostId(null)}  />
    </>
  );
};

export default PostsList;