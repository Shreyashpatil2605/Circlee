import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather, FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSavedPosts } from "@/hooks/useSavedPosts";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import { PostCard } from "@/components/PostCard";
import CommentsModal from "@/components/CommentsModal";
import { Post } from "@/types";

export default function SavedPostsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, isLoading: isUserLoading } = useCurrentUser();
  const { savedPosts, isLoading, isRefetching, error, refetch } = useSavedPosts();

  const {
    toggleLike,
    toggleReshare,
    toggleSave,
    deletePost,
    checkIsLiked,
    checkIsReshared,
    checkIsSaved,
  } = usePosts();

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Gracefully filter out null or deleted posts
  const validSavedPosts = useMemo(() => {
    if (!Array.isArray(savedPosts)) return [];
    return savedPosts.filter(
      (post: Post | null | undefined): post is Post =>
        Boolean(post && post._id && post.user && typeof post.user === "object")
    );
  }, [savedPosts]);

  const selectedPost = selectedPostId
    ? validSavedPosts.find((p) => p._id === selectedPostId) ?? null
    : null;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/profile");
    }
  };

  const handleExplore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={22} color="#F5F5F7" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <FontAwesome
              name="bookmark"
              size={17}
              color="#8B5CF6"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.headerTitle}>Saved Posts</Text>
          </View>
        </View>

        <View style={styles.badgeContainer}>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{validSavedPosts.length}</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      {isLoading || isUserLoading ? (
        <View style={styles.centerContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Loading saved posts...</Text>
          </View>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <View style={styles.cardContainer}>
            <View style={styles.errorIconWrapper}>
              <Feather name="alert-circle" size={24} color="#EF4444" />
            </View>
            <Text style={styles.errorTitle}>Failed to load saved posts</Text>
            <Text style={styles.errorDescription}>
              Something went wrong while fetching your saved posts. Please try
              again.
            </Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                refetch();
              }}
              style={styles.actionButton}
              activeOpacity={0.8}
            >
              <Feather
                name="refresh-cw"
                size={15}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.actionButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : validSavedPosts.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#8B5CF6"
              colors={["#8B5CF6"]}
            />
          }
        >
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <FontAwesome name="bookmark" size={32} color="#8B5CF6" />
            </View>
            <Text style={styles.emptyTitle}>No saved posts yet</Text>
            <Text style={styles.emptyDescription}>
              Save posts you want to revisit by tapping the bookmark icon in
              your feed. All your bookmarked content will appear here.
            </Text>
            <TouchableOpacity
              onPress={handleExplore}
              style={styles.actionButton}
              activeOpacity={0.8}
            >
              <Feather
                name="compass"
                size={16}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.actionButtonText}>Explore Feed</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 32,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#8B5CF6"
              colors={["#8B5CF6"]}
            />
          }
        >
          {/* Subheader info */}
          <View style={styles.feedInfoBar}>
            <Text style={styles.feedInfoText}>
              {validSavedPosts.length === 1
                ? "1 post saved"
                : `${validSavedPosts.length} posts saved`}
            </Text>
            <Text style={styles.feedInfoSubtext}>
              Tap the bookmark icon to unsave
            </Text>
          </View>

          {validSavedPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={currentUser}
              isLiked={checkIsLiked(post.likes, currentUser)}
              isReshared={checkIsReshared(post.reshares, currentUser)}
              isSaved={checkIsSaved(post._id, currentUser)}
              onLike={toggleLike}
              onReshare={toggleReshare}
              onSave={toggleSave}
              onDelete={deletePost}
              onComment={(p: Post) => {
                if (p?._id) setSelectedPostId(p._id);
              }}
            />
          ))}
        </ScrollView>
      )}

      {/* Comments Modal */}
      {selectedPost && (
        <CommentsModal
          selectedPost={selectedPost}
          onClose={() => setSelectedPostId(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B10",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#272733",
    backgroundColor: "#0B0B10",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#14141C",
    borderWidth: 1,
    borderColor: "#272733",
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F5F5F7",
    letterSpacing: -0.3,
  },
  badgeContainer: {
    width: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#1B1B25",
    borderWidth: 1,
    borderColor: "#272733",
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8B5CF6",
  },
  scrollView: {
    flex: 1,
  },
  feedInfoBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1B1B25",
  },
  feedInfoText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#A1A1AA",
  },
  feedInfoSubtext: {
    fontSize: 12,
    color: "#71717A",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingCard: {
    backgroundColor: "#14141C",
    borderWidth: 1,
    borderColor: "#272733",
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: "#A1A1AA",
    fontWeight: "500",
  },
  emptyScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyContainer: {
    backgroundColor: "#14141C",
    borderWidth: 1,
    borderColor: "#272733",
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 360,
    width: "100%",
  },
  emptyIconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F5F5F7",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: "#A1A1AA",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  cardContainer: {
    backgroundColor: "#14141C",
    borderWidth: 1,
    borderColor: "#272733",
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 360,
    width: "100%",
  },
  errorIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#F5F5F7",
    marginBottom: 6,
    textAlign: "center",
  },
  errorDescription: {
    fontSize: 13,
    color: "#A1A1AA",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
