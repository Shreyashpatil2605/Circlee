import React, { useState } from "react";
import { RefreshControl, ScrollView, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserSync } from "@/hooks/useUserSync";
import { usePosts } from "@/hooks/usePosts";
import { HomeHeader } from "@/components/HomeHeader";
import { PostComposer } from "@/components/PostComposer";
import { PostsList } from "@/components/PostsList";

const HomeScreen: React.FC = () => {
  const [isRefetching, setIsRefetching] = useState(false);
  const { refetch: refetchPosts } = usePosts();

  const handlePullToRefresh = async () => {
    setIsRefetching(true);
    await refetchPosts();
    setIsRefetching(false);
  };

  useUserSync();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0B10" />
      <HomeHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handlePullToRefresh}
            tintColor="#8B5CF6"
            colors={["#8B5CF6"]}
            progressBackgroundColor="#14141C"
          />
        }
      >
        <PostComposer />
        <PostsList />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0B10",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#0B0B10",
  },
  scrollContent: {
    paddingBottom: 90, // Calibrated for the refined 56px floating navbar with comfortable clearance
  },
});

export default HomeScreen;
