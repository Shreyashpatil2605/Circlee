import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolateColor,
} from "react-native-reanimated";
import { Post, User } from "@/types";
import { formatDate, formatNumber } from "@/utils/formatters";
import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { tabNavigation } from "@/utils/tabNavigation";
import * as Haptics from "expo-haptics";
import { modalService } from "@/context/ModalContext";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onReshare?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onDelete: (postId: string) => void;
  onComment: (post: Post) => void;
  isLiked: boolean;
  isReshared?: boolean;
  isSaved?: boolean;
  currentUser: User;
  viewingUsername?: string;
}

export const PostCard: React.FC<PostCardProps> = ({
  currentUser,
  isLiked,
  isReshared = false,
  isSaved = false,
  onLike,
  onReshare,
  onSave,
  onDelete,
  onComment,
  post,
  viewingUsername,
}) => {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const isOwnPost = Boolean(
    (currentUser?._id && post?.user?._id && currentUser._id.toString() === post.user._id.toString()) ||
    (currentUser?.clerkId && post?.user?.clerkId && currentUser.clerkId === post.user.clerkId)
  );
  const avatarUrl =
    post?.user?.profilePicture ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120";

  // Check if post is shown as a reshare on a profile feed
  const isResharedFeedItem = Boolean(
    viewingUsername &&
      post?.user?.username &&
      post.user.username.toLowerCase() !== viewingUsername.toLowerCase()
  );

  const resharerDisplayName =
    viewingUsername &&
    currentUser?.username &&
    viewingUsername.toLowerCase() === currentUser.username.toLowerCase()
      ? "You"
      : viewingUsername
      ? `@${viewingUsername}`
      : "Someone";

  // Available container width accounting for card margin (16 * 2) and padding (14 * 2)
  const estimatedWidth = Math.max(windowWidth - 60, 200);
  const [containerWidth, setContainerWidth] = useState<number>(estimatedWidth);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Sync width on window dimension change (e.g., orientation change)
  useEffect(() => {
    setContainerWidth(Math.max(windowWidth - 60, 200));
  }, [windowWidth]);

  // Pre-fetch natural image dimensions to calculate ideal height without letterboxing
  useEffect(() => {
    if (post.image) {
      let isMounted = true;
      Image.getSize(
        post.image,
        (width, height) => {
          if (isMounted && width > 0 && height > 0) {
            setImageDimensions({ width, height });
          }
        },
        () => {
          if (isMounted) setIsImageLoading(false);
        }
      );
      return () => {
        isMounted = false;
      };
    }
  }, [post.image]);

  // Compute adaptive container height:
  // - Adapts to landscape, square, and portrait aspect ratios
  // - Capped between minHeight (160px) and maxHeight (up to 380px or 48% screen height)
  const minHeight = 160;
  const maxHeight = Math.min(Math.round(windowHeight * 0.48), 380);

  let containerHeight = Math.round(containerWidth * 0.75); // 4:3 default fallback
  if (imageDimensions && imageDimensions.width > 0 && imageDimensions.height > 0) {
    const rawAspectRatio = imageDimensions.width / imageDimensions.height;
    const computedHeight = containerWidth / rawAspectRatio;
    containerHeight = Math.round(Math.min(maxHeight, Math.max(minHeight, computedHeight)));
  }

  // Double-tap to like animations
  const glowProgress = useSharedValue(0);
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

  const lastTapRef = useRef<number>(0);
  const isLocallyLikedRef = useRef<boolean>(isLiked);

  useEffect(() => {
    isLocallyLikedRef.current = isLiked;
  }, [isLiked]);

  const playDoubleTapAnimation = useCallback(() => {
    // 1. Neon Purple Border Glow:
    // Rises to vivid neon violet in 180ms, then fades smoothly back to normal in 650ms (~830ms total)
    glowProgress.value = 0;
    glowProgress.value = withSequence(
      withTiming(1, { duration: 180 }),
      withTiming(0, { duration: 650 })
    );

    // 2. Animated Large Heart:
    // Springs up with slight overshoot, holds, then shrinks and fades away (~540ms total)
    heartScale.value = 0.25;
    heartOpacity.value = 0;

    heartScale.value = withSequence(
      withSpring(1.15, { damping: 11, stiffness: 220 }),
      withTiming(1.0, { duration: 180 }),
      withTiming(0.85, { duration: 200 }),
      withTiming(0, { duration: 0 })
    );

    heartOpacity.value = withSequence(
      withTiming(1, { duration: 120 }),
      withTiming(1, { duration: 220 }),
      withTiming(0, { duration: 200 })
    );
  }, [glowProgress, heartScale, heartOpacity]);

  const handleDoubleTap = useCallback(() => {
    playDoubleTapAnimation();

    // If not already liked, like it exactly once
    if (!isLiked && !isLocallyLikedRef.current) {
      isLocallyLikedRef.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLike(post._id);
    } else {
      // If already liked, provide a pleasant haptic buzz without incrementing or unliking
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [isLiked, onLike, post._id, playDoubleTapAnimation]);

  const handleImagePress = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 280; // 280ms threshold (250-300ms range)
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      lastTapRef.current = 0; // Reset so a 3rd tap doesn't trigger another double-tap immediately
      handleDoubleTap();
    } else {
      lastTapRef.current = now;
    }
  }, [handleDoubleTap]);

  // Animated style for Card Container border and shadow glow
  const cardAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      glowProgress.value,
      [0, 1],
      ["#272733", "#A855F7"]
    );

    return {
      borderColor,
      shadowColor: glowProgress.value > 0.05 ? "#8B5CF6" : "#000000",
      shadowOpacity: 0.25 + glowProgress.value * 0.45,
      shadowRadius: 6 + glowProgress.value * 8,
      elevation: 3 + glowProgress.value * 3,
    };
  });

  // Animated style for Image Container border glow
  const imageBorderAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      glowProgress.value,
      [0, 1],
      ["#272733", "#A855F7"]
    );

    return {
      borderColor,
    };
  });

  // Animated style for Heart Overlay
  const heartAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: heartOpacity.value,
      transform: [{ scale: heartScale.value }],
    };
  });

  const handleDelete = () => {
    modalService.showAlert({
      title: "Delete Post?",
      description: "Are you sure you want to delete this post? This action cannot be undone.",
      icon: "trash-2",
      type: "danger",
      isDestructive: true,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: () => {
        onDelete(post._id);
        modalService.showToast("Post deleted", "info");
      },
    });
  };

  const handleUserPress = () => {
    if (isOwnPost) {
      tabNavigation.navigateToTab("profile");
      router.push("/(tabs)/profile");
    } else if (post.user?.username) {
      router.push(`/${post.user.username}`);
    }
  };

  return (
    <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
      {/* Reshare Context Banner on Profile Feeds */}
      {isResharedFeedItem && (
        <View style={styles.reshareBanner}>
          <Feather name="repeat" size={13} color="#8B5CF6" />
          <Text style={styles.reshareBannerText} numberOfLines={1}>
            {resharerDisplayName} reshared
          </Text>
        </View>
      )}

      {/* Header: Author Info & More/Delete Action */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={handleUserPress}
          activeOpacity={0.8}
          style={styles.authorSection}
        >
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.authorMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.authorName} numberOfLines={1}>
                {post?.user?.firstName || "User"} {post?.user?.lastName || ""}
              </Text>
              <Text style={styles.dotSeparator}>·</Text>
              <Text style={styles.timestamp}>
                {formatDate(post.createdAt)}
              </Text>
            </View>
            <Text style={styles.username} numberOfLines={1}>
              @{post?.user?.username || "user"}
            </Text>
          </View>
        </TouchableOpacity>

        {isOwnPost && (
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteButton}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Delete your post"
          >
            <Feather name="trash-2" size={13} color="#A1A1AA" />
          </TouchableOpacity>
        )}
      </View>

      {/* Caption / Content */}
      {Boolean(post.content) && (
        <Text style={styles.content}>{post.content}</Text>
      )}

      {/* Post Image with 100% width coverage and adaptive height */}
      {Boolean(post.image) && (
        <Animated.View
          style={[
            styles.imageContainer,
            { height: containerHeight },
            imageBorderAnimatedStyle,
          ]}
          onLayout={(e) => {
            const layoutWidth = e.nativeEvent.layout.width;
            if (layoutWidth > 0 && Math.abs(layoutWidth - containerWidth) > 1) {
              setContainerWidth(layoutWidth);
            }
          }}
        >
          <Pressable
            onPress={handleImagePress}
            style={styles.imagePressable}
            accessibilityRole="imagebutton"
            accessibilityLabel="Post image. Double tap to like."
          >
            <Image
              source={{ uri: post.image }}
              style={styles.postImage}
              resizeMode="cover"
              onLoad={(e) => {
                setIsImageLoading(false);
                const { width, height } = e.nativeEvent.source;
                if (width > 0 && height > 0) {
                  setImageDimensions({ width, height });
                }
              }}
              onError={() => {
                setIsImageLoading(false);
              }}
            />
          </Pressable>

          {isImageLoading && (
            <View style={styles.imageLoadingOverlay} pointerEvents="none">
              <ActivityIndicator size="small" color="#8B5CF6" />
            </View>
          )}

          {/* Animated Heart Overlay on Double-Tap */}
          <Animated.View
            style={[styles.heartOverlay, heartAnimatedStyle]}
            pointerEvents="none"
          >
            <View style={styles.heartGlowRing} />
            <FontAwesome
              name="heart"
              size={82}
              color="#A855F7"
              style={styles.heartIcon}
            />
          </Animated.View>
        </Animated.View>
      )}

      {/* Action Controls Bar */}
      <View style={styles.actionBar}>
        {/* Comment Action */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment(post)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Comment on post. ${post.comments?.length || 0} comments`}
        >
          <Feather name="message-circle" size={17} color="#A1A1AA" />
          <Text style={styles.actionText}>
            {formatNumber(post.comments?.length || 0)}
          </Text>
        </TouchableOpacity>

        {/* Reshare Action */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onReshare?.(post._id);
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Reshare post. ${post.reshares?.length || 0} reshares`}
        >
          <Feather
            name="repeat"
            size={16}
            color={isReshared ? "#8B5CF6" : "#A1A1AA"}
          />
          <Text
            style={[
              styles.actionText,
              isReshared && styles.actionTextReshared,
            ]}
          >
            {formatNumber(post.reshares?.length || 0)}
          </Text>
        </TouchableOpacity>

        {/* Like Action */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            isLocallyLikedRef.current = !isLiked;
            onLike(post._id);
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Like post. ${post.likes?.length || 0} likes`}
        >
          {isLiked ? (
            <AntDesign name="heart" size={17} color="#8B5CF6" />
          ) : (
            <Feather name="heart" size={17} color="#A1A1AA" />
          )}
          <Text
            style={[
              styles.actionText,
              isLiked && styles.actionTextLiked,
            ]}
          >
            {formatNumber(post.likes?.length || 0)}
          </Text>
        </TouchableOpacity>

        {/* Bookmark / Save Action */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSave?.(post._id);
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? "Remove from saved posts" : "Save post"}
        >
          {isSaved ? (
            <FontAwesome name="bookmark" size={17} color="#8B5CF6" />
          ) : (
            <Feather name="bookmark" size={17} color="#A1A1AA" />
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#14141C",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#272733",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  reshareBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    paddingLeft: 2,
  },
  reshareBannerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8B5CF6",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  authorSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1B1B25",
    borderWidth: 1.5,
    borderColor: "#272733",
    overflow: "hidden",
    marginRight: 10,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  authorMeta: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
  },
  authorName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F5F5F7",
    marginRight: 4,
    flexShrink: 1,
  },
  dotSeparator: {
    fontSize: 14,
    color: "#71717A",
    marginRight: 4,
  },
  timestamp: {
    fontSize: 13,
    color: "#71717A",
    flexShrink: 0,
  },
  username: {
    fontSize: 13,
    color: "#71717A",
    marginTop: 1,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(39, 39, 51, 0.4)",
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    color: "#F5F5F7",
    marginVertical: 10,
  },
  imageContainer: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#272733",
    backgroundColor: "#1B1B25",
    marginBottom: 10,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePressable: {
    width: "100%",
    height: "100%",
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1B1B25",
  },
  heartOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  heartGlowRing: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(168, 85, 247, 0.28)",
    shadowColor: "#A855F7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 8,
  },
  heartIcon: {
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
    elevation: 8,
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(39, 39, 51, 0.6)",
    paddingTop: 10,
    marginTop: 0,
    paddingHorizontal: 2,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 13,
    color: "#A1A1AA",
    marginLeft: 6,
    fontVariant: ["tabular-nums"],
  },
  actionTextLiked: {
    color: "#8B5CF6",
    fontWeight: "700",
  },
  actionTextReshared: {
    color: "#8B5CF6",
    fontWeight: "700",
  },
});

export const FeedPostCard = PostCard;
export default PostCard;
