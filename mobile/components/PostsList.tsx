import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import { Post } from "@/types";
import CommentsModal from "./CommentsModal";
import { PostCard } from "./PostCard";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";

export const PostsList: React.FC<{ username?: string }> = ({ username }) => {
  const { currentUser, isLoading: isUserLoading } = useCurrentUser();
  const {
    posts,
    isLoading,
    error,
    refetch,
    toggleLike,
    toggleReshare,
    toggleSave,
    deletePost,
    checkIsLiked,
    checkIsReshared,
    checkIsSaved,
  } = usePosts(username);

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [activeHighlightCommentId, setActiveHighlightCommentId] = useState<string | null>(null);

  const params = useLocalSearchParams();
  const openPostCommentsId = params.openPostCommentsId as string | undefined;
  const highlightCommentId = params.highlightCommentId as string | undefined;

  useEffect(() => {
    if (openPostCommentsId) {
      setSelectedPostId(openPostCommentsId);
      if (highlightCommentId) {
        setActiveHighlightCommentId(highlightCommentId);
      }
      router.setParams({ openPostCommentsId: undefined, highlightCommentId: undefined });
    }
  }, [openPostCommentsId, highlightCommentId]);

  const selectedPost = selectedPostId
    ? (posts?.find((p: Post) => p?._id === selectedPostId) ?? null)
    : null;

  // Loading State
  if (isLoading || isUserLoading) {
    return (
      <View style={styles.stateContainer}>
        <View style={styles.loadingSpinnerWrapper}>
          <ActivityIndicator size="small" color="#8B5CF6" />
        </View>
        <Text style={styles.loadingText}>Loading feed...</Text>
      </View>
    );
  }

  // Error State
  if (error) {
    return (
      <View style={styles.cardStateContainer}>
        <View style={styles.errorIconWrapper}>
          <Feather name="alert-circle" size={24} color="#EF4444" />
        </View>
        <Text style={styles.errorTitle}>Failed to load feed</Text>
        <Text style={styles.errorDescription}>
          Unable to connect to the server. Please check your network and try again.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // User Loading / Auth Wait State
  if (!currentUser) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="small" color="#8B5CF6" />
        <Text style={styles.loadingText}>Connecting to account...</Text>
      </View>
    );
  }

  // Empty State
  if (posts.length === 0) {
    return (
      <View style={styles.cardStateContainer}>
        <View style={styles.emptyIconWrapper}>
          <Feather name="compass" size={26} color="#8B5CF6" />
        </View>
        <Text style={styles.emptyTitle}>No posts yet</Text>
        <Text style={styles.emptyDescription}>
          Be the first to share something with your circle!
        </Text>
      </View>
    );
  }

  return (
    <>
      {posts
        ?.filter((post: Post | null | undefined): post is Post => Boolean(post && post._id))
        .map((post: Post) => (
          <PostCard
            key={post._id}
            post={post}
            onLike={toggleLike}
            onReshare={toggleReshare}
            onSave={toggleSave}
            onDelete={deletePost}
            onComment={(p: Post) => {
              if (p?._id) setSelectedPostId(p._id);
            }}
            currentUser={currentUser}
            isLiked={checkIsLiked(post.likes, currentUser)}
            isReshared={checkIsReshared(post.reshares, currentUser)}
            isSaved={checkIsSaved(post._id, currentUser)}
            viewingUsername={username}
          />
        ))}

      {selectedPost && (
        <CommentsModal
          selectedPost={selectedPost}
          onClose={() => {
            setSelectedPostId(null);
            setActiveHighlightCommentId(null);
          }}
          highlightCommentId={activeHighlightCommentId || undefined}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  stateContainer: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingSpinnerWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#14141C",
    borderWidth: 1,
    borderColor: "#272733",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#A1A1AA",
    fontWeight: "500",
  },
  cardStateContainer: {
    marginHorizontal: 16,
    marginVertical: 20,
    backgroundColor: "#14141C",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#272733",
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  errorIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F5F5F7",
    marginBottom: 4,
  },
  errorDescription: {
    fontSize: 13,
    color: "#A1A1AA",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
    maxWidth: 260,
  },
  retryButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 20,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#1B1B25",
    borderWidth: 1,
    borderColor: "#272733",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#F5F5F7",
    marginBottom: 4,
  },
  emptyDescription: {
    fontSize: 13,
    color: "#A1A1AA",
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 240,
  },
});

export default PostsList;
