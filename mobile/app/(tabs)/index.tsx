import { Image, RefreshControl, ScrollView, View } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SignOutButton from "@/components/SignOutButton";
import { useUserSync } from "@/hooks/useUserSync";
import PostComposer from "@/components/PostComposer";
import PostsList from "@/components/PostsList";
import { usePosts } from "@/hooks/usePosts";
import ScreenHeader from "@/components/ui/ScreenHeader";

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
    <SafeAreaView className="flex-1 bg-chat-bg" edges={["top"]}>
      <ScreenHeader
        title="Home"
        leftSlot={
          <Image
            source={require("../../assets/images/color-adjustment.png")}
            className="w-9 h-9"
            style={{ tintColor: '#0A84FF' }}
          />
        }
        rightSlot={<SignOutButton />}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 mt-2 bg-chat-bg"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handlePulltoRefresh}
            tintColor={"#0A84FF"}
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
