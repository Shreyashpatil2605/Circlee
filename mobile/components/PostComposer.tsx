import {
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import React from "react";
import { useCreatePost } from "@/hooks/useCreatePost";
import { useUser } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";
import Avatar from "@/components/ui/Avatar";

const PostComposer = () => {
  const {
    content,
    setContent,
    selectedImage,
    isCreating,
    pickImageFromGallery,
    takePhoto,
    removeImage,
    createPost,
  } = useCreatePost();
  const { user } = useUser();

  return (
    <View className="mb-3 mx-3">
      <GlassCard className="p-4">
        {/*Whats Happening */}
        <View className="flex-row">
          <Avatar
            uri={user?.imageUrl}
            size={48}
            className="mr-3"
            borderClassName="border border-accent-blue/30"
          />
          <View className="flex-1">
            <TextInput
              className="text-text-primary text-base pt-1"
              placeholder="What's happening?"
              placeholderTextColor="#6B7280"
              multiline
              value={content}
              onChangeText={setContent}
              maxLength={200}
            />
          </View>
        </View>

        {/* Image Display */}
        {selectedImage && (
          <View className="mt-3">
            <View className="relative">
              <Image
                source={{ uri: selectedImage }}
                className="w-full h-48 rounded-xl border border-border-glass-light"
              />
              <TouchableOpacity
                className="absolute top-2 right-2 w-8 h-8 bg-glass-medium rounded-full items-center justify-center border border-border-glass-highlight"
                onPress={removeImage}
              >
                <Feather name="x" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Image picker and Camera icons with Post button */}
        <View className="flex-row justify-between items-center mt-4">
          <View className="flex-row items-center">
            <TouchableOpacity className="mr-5 p-1" onPress={pickImageFromGallery}>
              <Feather name="image" size={20} color="#0A84FF" />
            </TouchableOpacity>
            <TouchableOpacity className="mr-5 p-1" onPress={takePhoto}>
              <Feather name="camera" size={20} color="#0A84FF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className={`px-5 py-2 rounded-xl ${
              content.trim() || selectedImage
                ? "bg-accent-blue"
                : "bg-white/5 border border-white/10"
            }`}
            style={
              content.trim() || selectedImage
                ? {
                    shadowColor: "#0A84FF",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 3,
                  }
                : {}
            }
            onPress={createPost}
            disabled={isCreating || !(content.trim() || selectedImage)}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                className={`font-semibold text-sm ${
                  content.trim() || selectedImage
                    ? "text-white"
                    : "text-zinc-500"
                }`}
              >
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </GlassCard>
    </View>
  );
};

export default PostComposer;
