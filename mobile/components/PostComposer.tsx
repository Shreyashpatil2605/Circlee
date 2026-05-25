import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { useCreatePost } from "@/hooks/useCreatePost";
import { useUser } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { getCameraPermissionsAsync } from "expo-image-picker";
import { BlurView } from "expo-blur";

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
    <View className="mb-2 mx-2 rounded-2xl overflow-hidden border border-gray-200">
      <BlurView intensity={30} tint="light" className="p-4">
        {/*Whats Happening */}
        <View className="flex-row">
          <Image
            source={{ uri: user?.imageUrl }}
            className="w-12 h-12 rounded-full mr-3 border border-neon-purple/50"
          />
          <View className="flex-1">
            <TextInput
              className="text-black text-lg"
              placeholder="What's happening?"
              placeholderTextColor="#9CA3AF"
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
                className="w-full h-48 rounded-2xl border border-gray-200"
              />
              <TouchableOpacity
                className="absolute top-2 right-2 w-8 h-8 bg-white/60 rounded-full items-center justify-center"
                onPress={removeImage}
              >
                <Feather name="x" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Image picker and Camera icons with Post button */}
        <View className="flex-row justify-between items-center mt-3">
          <View className="flex-row">
            <TouchableOpacity className="mr-4" onPress={pickImageFromGallery}>
              <Feather name="image" size={20} color="#9D00FF" />
            </TouchableOpacity>
            <TouchableOpacity className="mr-4" onPress={takePhoto}>
              <Feather name="camera" size={20} color="#9D00FF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className={`px-6 py-2 rounded-full ${
              content.trim() || selectedImage ? "bg-neon-purple" : "bg-gray-200"
            }`}
            style={
              content.trim() || selectedImage
                ? {
                    shadowColor: "#9D00FF",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 10,
                    elevation: 5,
                  }
                : {}
            }
            onPress={createPost}
            disabled={isCreating || !(content.trim() || selectedImage)}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text
                className={`font-semibold ${
                  content.trim() || selectedImage
                    ? "text-white"
                    : "text-gray-600"
                }`}
              >
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

export default PostComposer;
