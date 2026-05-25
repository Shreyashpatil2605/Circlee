import { Image, RefreshControl, ScrollView, Text, View } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import SignOutButton from "@/components/SignOutButton";
import { useUserSync } from "@/hooks/useUserSync";
import PostComposer from "@/components/PostComposer";
import PostsList from "@/components/PostsList";
import { usePosts } from "@/hooks/usePosts";

const HomeScreen = () => {
  const [isRefetching, setisRefectching] = useState(false);

  const { refetch: refetchingPosts } = usePosts();

  const handlePulltoRefresh = async () => {
    setisRefectching(true);
    await refetchingPosts();
    setisRefectching(false);
  };

  useUserSync();
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <BlurView intensity={20} tint="light" className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200 z-10">
        <Image
          source={require("../../assets/images/color-adjustment.png")}
          className="size-10"
          style={{ tintColor: '#9D00FF' }}
        />
        <Text className="text-xl font-bold text-black" style={{ textShadowColor: '#9D00FF', textShadowRadius: 10 }}>Home</Text>
        <SignOutButton />
      </BlurView>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 mt-2"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handlePulltoRefresh}
            tintColor={"#9D00FF"}
          />
        }
      >
        <PostComposer />
        <PostsList />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
