import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  RefreshControl,
  StatusBar,
  BackHandler,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDebounce } from "use-debounce";
import * as Haptics from "expo-haptics";

import { SearchBar, SearchBarRef } from "@/components/ui/SearchBar";
import { Avatar } from "@/components/ui/Avatar";
import { usePosts } from "@/hooks/usePosts";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSearchUsers } from "@/hooks/useSearchUsers";
import { useSuggestedUsers, SuggestedUser } from "@/hooks/useSuggestedUsers";
import { useFollowUser } from "@/hooks/useFollowUser";
import { Post } from "@/types";
import { modalService } from "@/context/ModalContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_GAP = 10;

// 1. Explore Categories
const EXPLORE_CATEGORIES = [
  { id: "for_you", label: "For You", icon: "creation" },
  { id: "technology", label: "Technology", icon: "chip" },
  { id: "photography", label: "Photography", icon: "camera-outline" },
  { id: "gaming", label: "Gaming", icon: "gamepad-variant-outline" },
  { id: "lifestyle", label: "Lifestyle", icon: "coffee-outline" },
  { id: "entertainment", label: "Entertainment", icon: "movie-open-outline" },
] as const;

type CategoryId = (typeof EXPLORE_CATEGORIES)[number]["id"];

// Category keyword mapping for dynamic post filtering
const CATEGORY_KEYWORDS: Record<CategoryId, string[]> = {
  for_you: [],
  technology: [
    "tech",
    "code",
    "coding",
    "developer",
    "dev",
    "software",
    "hardware",
    "react",
    "native",
    "mobile",
    "ai",
    "programming",
    "app",
    "web",
    "typescript",
    "javascript",
    "python",
  ],
  photography: [
    "photo",
    "photography",
    "camera",
    "shot",
    "pic",
    "sunset",
    "nature",
    "portrait",
    "landscape",
    "view",
    "lens",
    "art",
    "capture",
  ],
  gaming: [
    "game",
    "gaming",
    "gamer",
    "play",
    "stream",
    "streamer",
    "xbox",
    "playstation",
    "nintendo",
    "steam",
    "esports",
    "rpg",
    "fps",
    "arcade",
  ],
  lifestyle: [
    "life",
    "lifestyle",
    "daily",
    "coffee",
    "travel",
    "fitness",
    "workout",
    "gym",
    "food",
    "health",
    "wellness",
    "style",
    "fashion",
    "morning",
  ],
  entertainment: [
    "movie",
    "film",
    "music",
    "song",
    "show",
    "series",
    "tv",
    "cinema",
    "actor",
    "concert",
    "festival",
    "dance",
    "video",
    "fun",
  ],
};

type PostFilterOption = "all" | "media" | "popular" | "latest";
type SearchTab = "all" | "people" | "posts" | "hashtags";

export const SearchScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser } = useCurrentUser();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounce(searchQuery, 350);
  const [searchTab, setSearchTab] = useState<SearchTab>("all");
  const searchBarRef = useRef<SearchBarRef>(null);

  // Category and filter state
  const [activeCategory, setActiveCategory] = useState<CategoryId>("for_you");
  const [postFilter, setPostFilter] = useState<PostFilterOption>("all");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Selected post preview modal
  const [selectedPostPreview, setSelectedPostPreview] = useState<Post | null>(null);

  // Optimistic follow states for suggested users
  const [optimisticFollows, setOptimisticFollows] = useState<Record<string, boolean>>({});

  // Android hardware back button handler
  useEffect(() => {
    const onBackPress = () => {
      if (isFilterModalVisible) {
        setIsFilterModalVisible(false);
        return true;
      }
      if (selectedPostPreview) {
        setSelectedPostPreview(null);
        return true;
      }
      if (Keyboard.isVisible()) {
        Keyboard.dismiss();
        return true;
      }
      if (searchQuery.trim().length > 0) {
        setSearchQuery("");
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    return () => subscription.remove();
  }, [searchQuery, isFilterModalVisible, selectedPostPreview]);

  // 1. Fetch real posts from backend
  const {
    posts: allPosts = [],
    isLoading: isPostsLoading,
    refetch: refetchPosts,
    toggleLike,
  } = usePosts();

  // 2. Fetch suggested users
  const {
    users: suggestedUsers = [],
    refetch: refetchSuggested,
  } = useSuggestedUsers();

  // 3. Search users from API
  const {
    users: searchedUsers = [],
    isLoading: isSearchUsersLoading,
  } = useSearchUsers(debouncedQuery);

  // 4. Follow user action
  const { followUser } = useFollowUser();

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Promise.all([refetchPosts(), refetchSuggested()]);
  };

  // ----------------------------------------------------
  // Trending Hashtags: Derived from actual database posts
  // ----------------------------------------------------
  const trendingHashtags = useMemo(() => {
    const map = new Map<string, number>();

    (allPosts || []).forEach((post: Post) => {
      if (post.content) {
        const matches = post.content.match(/#[a-zA-Z0-9_]+/g);
        if (matches) {
          const uniqueInPost = new Set(matches.map((m) => m.toLowerCase()));
          uniqueInPost.forEach((tag) => {
            map.set(tag, (map.get(tag) || 0) + 1);
          });
        }
      }
    });

    const list = Array.from(map.entries())
      .map(([tag, count], index) => ({
        tag,
        count,
        rank: index + 1,
        isTrending: count >= 2,
      }))
      .sort((a, b) => b.count - a.count);

    return list;
  }, [allPosts]);

  // ----------------------------------------------------
  // Search Filtering: Posts and Hashtags
  // ----------------------------------------------------
  const searchedPosts = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    if (!q) return [];
    return (allPosts || []).filter((post: Post) => {
      const contentMatch = post.content?.toLowerCase().includes(q);
      const userMatch =
        post.user?.username?.toLowerCase().includes(q) ||
        post.user?.firstName?.toLowerCase().includes(q) ||
        post.user?.lastName?.toLowerCase().includes(q);
      return contentMatch || userMatch;
    });
  }, [allPosts, debouncedQuery]);

  const searchedHashtags = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim().replace(/^#/, "");
    if (!q) return [];
    return trendingHashtags.filter((item) =>
      item.tag.toLowerCase().replace(/^#/, "").includes(q)
    );
  }, [trendingHashtags, debouncedQuery]);

  // ----------------------------------------------------
  // Explore Feed Posts: Filtered by Category & Post Filter
  // ----------------------------------------------------
  const displayedExplorePosts = useMemo(() => {
    let result = [...(allPosts || [])];

    // Filter by Category
    if (activeCategory !== "for_you") {
      const keywords = CATEGORY_KEYWORDS[activeCategory];
      result = result.filter((post: Post) => {
        if (!post.content && !post.image) return false;
        const contentLower = (post.content || "").toLowerCase();

        // If photography category and post has image, consider it a match
        if (activeCategory === "photography" && post.image) {
          return true;
        }

        return keywords.some((kw) => contentLower.includes(kw));
      });
    }

    // Filter by Media / Popular / Latest
    if (postFilter === "media") {
      result = result.filter((post: Post) => Boolean(post.image));
    } else if (postFilter === "popular") {
      result.sort((a: Post, b: Post) => {
        const aLikes = Array.isArray(a.likes) ? a.likes.length : 0;
        const bLikes = Array.isArray(b.likes) ? b.likes.length : 0;
        return bLikes - aLikes;
      });
    } else if (postFilter === "latest") {
      result.sort((a: Post, b: Post) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
    }

    return result;
  }, [allPosts, activeCategory, postFilter]);

  // Two-column split for responsive grid
  const [columnOnePosts, columnTwoPosts] = useMemo(() => {
    const col1: Post[] = [];
    const col2: Post[] = [];
    displayedExplorePosts.forEach((post, index) => {
      if (index % 2 === 0) {
        col1.push(post);
      } else {
        col2.push(post);
      }
    });
    return [col1, col2];
  }, [displayedExplorePosts]);

  // ----------------------------------------------------
  // Follow / Unfollow Handler
  // ----------------------------------------------------
  const handleFollowToggle = useCallback(
    async (user: SuggestedUser) => {
      if (!user._id) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const userIdStr = user._id.toString();
      const currentFollowingIds = new Set(
        (currentUser?.following || []).map((u: any) =>
          typeof u === "string" ? u : u._id?.toString()
        )
      );

      const isCurrentlyFollowing =
        optimisticFollows[userIdStr] !== undefined
          ? optimisticFollows[userIdStr]
          : currentFollowingIds.has(userIdStr);

      const nextState = !isCurrentlyFollowing;
      setOptimisticFollows((prev) => ({ ...prev, [userIdStr]: nextState }));

      try {
        await followUser(user._id);
        modalService.showToast(
          nextState ? `Followed @${user.username}` : `Unfollowed @${user.username}`,
          "info"
        );
      } catch {
        // Revert optimistic state on error
        setOptimisticFollows((prev) => ({ ...prev, [userIdStr]: isCurrentlyFollowing }));
      }
    },
    [currentUser?.following, followUser, optimisticFollows]
  );

  const handleHashtagPress = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchQuery(tag);
  };

  const handleCategoryPress = (catId: CategoryId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCategory(catId);
  };

  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. Header */}
      <View style={[styles.headerRow, { paddingTop: Math.max(insets.top + 6, 24) }]}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.headerSubtitle}>Discover trending topics, creators & posts</Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsFilterModalVisible(true);
          }}
          activeOpacity={0.7}
          style={[styles.filterIconButton, postFilter !== "all" && styles.filterIconButtonActive]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather
            name="sliders"
            size={18}
            color={postFilter !== "all" ? "#8B5CF6" : "#FFFFFF"}
          />
        </TouchableOpacity>
      </View>

      {/* 2. Search Bar */}
      <View style={styles.searchBarWrapper}>
        <SearchBar
          ref={searchBarRef}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search people, posts, hashtags..."
          onClear={() => setSearchQuery("")}
          onFilterPress={() => setIsFilterModalVisible(true)}
          hasActiveFilters={postFilter !== "all"}
        />
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          paddingBottom: 120 + insets.bottom,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isPostsLoading}
            onRefresh={handleRefresh}
            tintColor="#8B5CF6"
          />
        }
      >
        {isSearchActive ? (
          /* ======================================================== */
          /* SEARCH MODE ACTIVE                                       */
          /* ======================================================== */
          <View style={styles.searchContentContainer}>
            {/* Search Tab Switcher */}
            <View style={styles.searchTabRow}>
              {(["all", "people", "posts", "hashtags"] as SearchTab[]).map((tab) => {
                const isActive = searchTab === tab;
                let badgeCount = 0;
                if (tab === "people") badgeCount = searchedUsers.length;
                if (tab === "posts") badgeCount = searchedPosts.length;
                if (tab === "hashtags") badgeCount = searchedHashtags.length;
                if (tab === "all")
                  badgeCount =
                    searchedUsers.length + searchedPosts.length + searchedHashtags.length;

                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSearchTab(tab);
                    }}
                    style={[styles.searchTabPill, isActive && styles.searchTabPillActive]}
                  >
                    <Text
                      style={[
                        styles.searchTabPillText,
                        isActive && styles.searchTabPillTextActive,
                      ]}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {badgeCount > 0 ? ` (${badgeCount})` : ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {isSearchUsersLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#8B5CF6" />
                <Text style={styles.loadingText}>Searching Circlee...</Text>
              </View>
            ) : (
              <View>
                {/* 1. People Section */}
                {(searchTab === "all" || searchTab === "people") && (
                  <View style={styles.sectionWrap}>
                    <View style={styles.sectionHeadingRow}>
                      <View style={styles.sectionHeadingLeft}>
                        <Feather name="users" size={15} color="#A855F7" />
                        <Text style={styles.sectionHeadingTitle}>People</Text>
                      </View>
                      <Text style={styles.sectionCountText}>{searchedUsers.length}</Text>
                    </View>

                    {searchedUsers.length === 0 ? (
                      searchTab === "people" && (
                        <View style={styles.emptyInline}>
                          <Text style={styles.emptyInlineText}>
                            No users found matching &quot;{searchQuery}&quot;
                          </Text>
                        </View>
                      )
                    ) : (
                      searchedUsers.map((user: any) => {
                        const displayName =
                          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                          user.username;
                        return (
                          <TouchableOpacity
                            key={user._id || user.username}
                            onPress={() => router.push(`/${user.username}`)}
                            activeOpacity={0.7}
                            style={styles.searchUserRow}
                          >
                            <Avatar
                              uri={user.profilePicture}
                              size={46}
                              borderClassName="border border-[#30303C]"
                            />
                            <View style={styles.searchUserInfo}>
                              <Text style={styles.searchUserName} numberOfLines={1}>
                                {displayName}
                              </Text>
                              <Text style={styles.searchUserHandle} numberOfLines={1}>
                                @{user.username}
                              </Text>
                            </View>
                            <Feather name="arrow-up-right" size={16} color="#8B5CF6" />
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </View>
                )}

                {/* 2. Hashtags Section */}
                {(searchTab === "all" || searchTab === "hashtags") && (
                  <View style={styles.sectionWrap}>
                    <View style={styles.sectionHeadingRow}>
                      <View style={styles.sectionHeadingLeft}>
                        <Feather name="hash" size={15} color="#A855F7" />
                        <Text style={styles.sectionHeadingTitle}>Hashtags</Text>
                      </View>
                      <Text style={styles.sectionCountText}>{searchedHashtags.length}</Text>
                    </View>

                    {searchedHashtags.length === 0 ? (
                      searchTab === "hashtags" && (
                        <View style={styles.emptyInline}>
                          <Text style={styles.emptyInlineText}>
                            No hashtags found for &quot;{searchQuery}&quot;
                          </Text>
                        </View>
                      )
                    ) : (
                      searchedHashtags.map((item) => (
                        <TouchableOpacity
                          key={item.tag}
                          onPress={() => handleHashtagPress(item.tag)}
                          activeOpacity={0.7}
                          style={styles.searchHashtagRow}
                        >
                          <View style={styles.hashtagIconBadge}>
                            <Feather name="hash" size={16} color="#8B5CF6" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.searchHashtagName}>{item.tag}</Text>
                            <Text style={styles.searchHashtagCount}>
                              {item.count} {item.count === 1 ? "post" : "posts"}
                            </Text>
                          </View>
                          <Feather name="chevron-right" size={16} color="#9999A8" />
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}

                {/* 3. Posts Section */}
                {(searchTab === "all" || searchTab === "posts") && (
                  <View style={styles.sectionWrap}>
                    <View style={styles.sectionHeadingRow}>
                      <View style={styles.sectionHeadingLeft}>
                        <Feather name="file-text" size={15} color="#A855F7" />
                        <Text style={styles.sectionHeadingTitle}>Posts</Text>
                      </View>
                      <Text style={styles.sectionCountText}>{searchedPosts.length}</Text>
                    </View>

                    {searchedPosts.length === 0 ? (
                      <View style={styles.emptyInline}>
                        <Text style={styles.emptyInlineText}>
                          No posts found matching &quot;{searchQuery}&quot;
                        </Text>
                      </View>
                    ) : (
                      searchedPosts.map((post: Post) => (
                        <TouchableOpacity
                          key={post._id}
                          onPress={() => setSelectedPostPreview(post)}
                          activeOpacity={0.7}
                          style={styles.searchPostCard}
                        >
                          <View style={styles.searchPostHeader}>
                            <Avatar
                              uri={post.user?.profilePicture}
                              size={28}
                              borderClassName="border border-[#30303C]"
                            />
                            <Text style={styles.searchPostAuthor} numberOfLines={1}>
                              {post.user?.firstName} {post.user?.lastName}
                            </Text>
                            <Text style={styles.searchPostHandle} numberOfLines={1}>
                              @{post.user?.username}
                            </Text>
                          </View>

                          {post.content ? (
                            <Text style={styles.searchPostContent} numberOfLines={3}>
                              {post.content}
                            </Text>
                          ) : null}

                          {post.image ? (
                            <Image
                              source={{ uri: post.image }}
                              style={styles.searchPostThumbnail}
                              resizeMode="cover"
                            />
                          ) : null}

                          <View style={styles.searchPostMeta}>
                            <View style={styles.searchPostMetaItem}>
                              <Feather name="heart" size={12} color="#9999A8" />
                              <Text style={styles.searchPostMetaText}>
                                {Array.isArray(post.likes) ? post.likes.length : 0}
                              </Text>
                            </View>
                            <View style={styles.searchPostMetaItem}>
                              <Feather name="message-circle" size={12} color="#9999A8" />
                              <Text style={styles.searchPostMetaText}>
                                {Array.isArray(post.comments) ? post.comments.length : 0}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        ) : (
          /* ======================================================== */
          /* EXPLORE HUB MODE                                         */
          /* ======================================================== */
          <View>
            {/* 3. Horizontal Category Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScrollContent}
              style={styles.categoryScrollView}
            >
              {EXPLORE_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => handleCategoryPress(cat.id)}
                    activeOpacity={0.7}
                    style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  >
                    <MaterialCommunityIcons
                      name={cat.icon as any}
                      size={15}
                      color={isActive ? "#8B5CF6" : "#9999A8"}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        isActive && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* 4. Trending Hashtags Section */}
            {trendingHashtags.length > 0 && (
              <View style={styles.exploreSection}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleLeft}>
                    <View style={styles.sectionIconBadge}>
                      <Feather name="trending-up" size={15} color="#A855F7" />
                    </View>
                    <Text style={styles.sectionTitleText}>Trending Topics</Text>
                  </View>
                  <Text style={styles.sectionSubtitleBadge}>Real-time</Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.trendingCardsScroll}
                >
                  {trendingHashtags.slice(0, 8).map((item) => (
                    <TouchableOpacity
                      key={item.tag}
                      onPress={() => handleHashtagPress(item.tag)}
                      activeOpacity={0.7}
                      style={styles.trendingCard}
                    >
                      <View style={styles.trendingCardTop}>
                        <Text style={styles.trendingRankText}>#{item.rank}</Text>
                        {item.isTrending && (
                          <View style={styles.trendingFireBadge}>
                            <Feather name="zap" size={10} color="#A855F7" />
                            <Text style={styles.trendingFireText}>Hot</Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.trendingTagName} numberOfLines={1}>
                        {item.tag}
                      </Text>
                      <Text style={styles.trendingCountText}>
                        {item.count} {item.count === 1 ? "Post" : "Posts"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 5. People You May Like Section */}
            {suggestedUsers.length > 0 && (
              <View style={styles.exploreSection}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleLeft}>
                    <View style={styles.sectionIconBadge}>
                      <Feather name="users" size={15} color="#A855F7" />
                    </View>
                    <Text style={styles.sectionTitleText}>People You May Like</Text>
                  </View>
                  <Text style={styles.sectionSubtitleBadge}>Suggested</Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.suggestedUsersScroll}
                >
                  {suggestedUsers.map((user: SuggestedUser) => {
                    const userIdStr = user._id?.toString() || user.username;
                    const currentFollowingSet = new Set(
                      (currentUser?.following || []).map((u: any) =>
                        typeof u === "string" ? u : u._id?.toString()
                      )
                    );

                    const isFollowing =
                      optimisticFollows[userIdStr] !== undefined
                        ? optimisticFollows[userIdStr]
                        : currentFollowingSet.has(userIdStr);

                    const displayName =
                      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                      user.username;

                    // Mutual calculation if available
                    const mutualCount = (user.followers || []).filter((f: any) =>
                      currentFollowingSet.has(typeof f === "string" ? f : f._id?.toString())
                    ).length;

                    return (
                      <View key={userIdStr} style={styles.suggestedUserCard}>
                        <TouchableOpacity
                          onPress={() => router.push(`/${user.username}`)}
                          activeOpacity={0.8}
                          style={styles.suggestedUserCardTop}
                        >
                          <Avatar
                            uri={user.profilePicture}
                            size={56}
                            borderClassName="border-2 border-[#8B5CF6]"
                          />
                          <Text style={styles.suggestedUserName} numberOfLines={1}>
                            {displayName}
                          </Text>
                          <Text style={styles.suggestedUserHandle} numberOfLines={1}>
                            @{user.username}
                          </Text>
                          <Text style={styles.suggestedUserMutual} numberOfLines={1}>
                            {mutualCount > 0
                              ? `${mutualCount} mutual connection${mutualCount === 1 ? "" : "s"}`
                              : "Active Creator"}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleFollowToggle(user)}
                          activeOpacity={0.7}
                          style={[
                            styles.suggestedFollowBtn,
                            isFollowing && styles.suggestedFollowBtnActive,
                          ]}
                        >
                          <Feather
                            name={isFollowing ? "check" : "user-plus"}
                            size={12}
                            color={isFollowing ? "#9999A8" : "#FFFFFF"}
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={[
                              styles.suggestedFollowText,
                              isFollowing && styles.suggestedFollowTextActive,
                            ]}
                          >
                            {isFollowing ? "Following" : "Follow"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* 6. Discover Posts Section (Responsive 2-Column Grid) */}
            <View style={styles.exploreSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleLeft}>
                  <View style={styles.sectionIconBadge}>
                    <Feather name="compass" size={15} color="#A855F7" />
                  </View>
                  <Text style={styles.sectionTitleText}>
                    {activeCategory === "for_you"
                      ? "Discover Posts"
                      : `Discover in ${EXPLORE_CATEGORIES.find((c) => c.id === activeCategory)?.label}`}
                  </Text>
                </View>

                <Text style={styles.sectionSubtitleBadge}>
                  {displayedExplorePosts.length}{" "}
                  {displayedExplorePosts.length === 1 ? "Post" : "Posts"}
                </Text>
              </View>

              {displayedExplorePosts.length === 0 ? (
                <View style={styles.emptyGridBox}>
                  <View style={styles.emptyGridIconCircle}>
                    <Feather name="inbox" size={26} color="#9999A8" />
                  </View>
                  <Text style={styles.emptyGridTitle}>No posts found</Text>
                  <Text style={styles.emptyGridSubtitle}>
                    {activeCategory === "for_you"
                      ? "No posts published yet. Be the first to share your thoughts!"
                      : `No posts found in ${EXPLORE_CATEGORIES.find((c) => c.id === activeCategory)?.label}.`}
                  </Text>
                </View>
              ) : (
                <View style={styles.gridContainer}>
                  {/* Left Column */}
                  <View style={styles.gridColumn}>
                    {columnOnePosts.map((post) => (
                      <GridPostCard
                        key={post._id}
                        post={post}
                        onPress={() => setSelectedPostPreview(post)}
                      />
                    ))}
                  </View>

                  {/* Right Column */}
                  <View style={styles.gridColumn}>
                    {columnTwoPosts.map((post) => (
                      <GridPostCard
                        key={post._id}
                        post={post}
                        onPress={() => setSelectedPostPreview(post)}
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ------------------------------------------------------------------ */}
      {/* 7. Post Detail Preview Modal                                        */}
      {/* ------------------------------------------------------------------ */}
      {selectedPostPreview && (
        <Modal
          visible={Boolean(selectedPostPreview)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedPostPreview(null)}
        >
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={() => setSelectedPostPreview(null)}>
              <View style={StyleSheet.absoluteFillObject} />
            </TouchableWithoutFeedback>

            <View style={styles.postPreviewCard}>
              {/* Header */}
              <View style={styles.previewHeader}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedPostPreview(null);
                    if (selectedPostPreview.user?.username) {
                      router.push(`/${selectedPostPreview.user.username}`);
                    }
                  }}
                  activeOpacity={0.8}
                  style={styles.previewAuthorRow}
                >
                  <Avatar
                    uri={selectedPostPreview.user?.profilePicture}
                    size={40}
                    borderClassName="border border-[#30303C]"
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.previewAuthorName} numberOfLines={1}>
                      {selectedPostPreview.user?.firstName} {selectedPostPreview.user?.lastName}
                    </Text>
                    <Text style={styles.previewAuthorHandle} numberOfLines={1}>
                      @{selectedPostPreview.user?.username}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedPostPreview(null)}
                  style={styles.previewCloseBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="x" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
                {selectedPostPreview.content ? (
                  <Text style={styles.previewPostText}>{selectedPostPreview.content}</Text>
                ) : null}

                {selectedPostPreview.image ? (
                  <Image
                    source={{ uri: selectedPostPreview.image }}
                    style={styles.previewPostImage}
                    resizeMode="cover"
                  />
                ) : null}
              </ScrollView>

              {/* Action Footer */}
              <View style={styles.previewFooter}>
                <View style={styles.previewStats}>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      toggleLike(selectedPostPreview._id);
                    }}
                    style={styles.previewStatBtn}
                  >
                    <Feather
                      name="heart"
                      size={18}
                      color={
                        Array.isArray(selectedPostPreview.likes) &&
                        selectedPostPreview.likes.some(
                          (id: any) => id?.toString() === currentUser?._id?.toString()
                        )
                          ? "#EF4444"
                          : "#9999A8"
                      }
                    />
                    <Text style={styles.previewStatText}>
                      {Array.isArray(selectedPostPreview.likes)
                        ? selectedPostPreview.likes.length
                        : 0}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.previewStatBtn}>
                    <Feather name="message-circle" size={18} color="#9999A8" />
                    <Text style={styles.previewStatText}>
                      {Array.isArray(selectedPostPreview.comments)
                        ? selectedPostPreview.comments.length
                        : 0}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    const un = selectedPostPreview.user?.username;
                    setSelectedPostPreview(null);
                    if (un) router.push(`/${un}`);
                  }}
                  activeOpacity={0.8}
                  style={styles.previewProfileBtn}
                >
                  <Text style={styles.previewProfileBtnText}>View Profile</Text>
                  <Feather name="arrow-up-right" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 8. Filter Bottom Sheet Modal                                       */}
      {/* ------------------------------------------------------------------ */}
      {isFilterModalVisible && (
        <Modal
          visible={isFilterModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsFilterModalVisible(false)}
        >
          <View style={styles.filterSheetBackdrop}>
            <TouchableWithoutFeedback onPress={() => setIsFilterModalVisible(false)}>
              <View style={StyleSheet.absoluteFillObject} />
            </TouchableWithoutFeedback>

            <View style={styles.filterSheetContainer}>
              <View style={styles.filterSheetHeader}>
                <View style={styles.filterSheetHandle} />
                <Text style={styles.filterSheetTitle}>Filter Explore Posts</Text>
                <Text style={styles.filterSheetSubtitle}>Sort and refine your discovery feed</Text>
              </View>

              <View style={styles.filterOptionsList}>
                {[
                  { id: "all", label: "All Posts", desc: "Show all community posts" },
                  { id: "media", label: "With Media Only", desc: "Photos and visual content" },
                  { id: "popular", label: "Most Popular", desc: "Ranked by like activity" },
                  { id: "latest", label: "Latest First", desc: "Most recently posted" },
                ].map((opt) => {
                  const isSelected = postFilter === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setPostFilter(opt.id as PostFilterOption);
                      }}
                      style={[
                        styles.filterOptionItem,
                        isSelected && styles.filterOptionItemActive,
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.filterOptionLabel,
                            isSelected && styles.filterOptionLabelActive,
                          ]}
                        >
                          {opt.label}
                        </Text>
                        <Text style={styles.filterOptionDesc}>{opt.desc}</Text>
                      </View>

                      {isSelected && (
                        <View style={styles.filterCheckCircle}>
                          <Feather name="check" size={14} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setIsFilterModalVisible(false);
                }}
                style={styles.filterApplyBtn}
              >
                <Text style={styles.filterApplyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

// ============================================================================
// Grid Post Card Subcomponent
// ============================================================================
interface GridPostCardProps {
  post: Post;
  onPress: () => void;
}

const GridPostCard: React.FC<GridPostCardProps> = ({ post, onPress }) => {
  const authorName =
    `${post.user?.firstName || ""} ${post.user?.lastName || ""}`.trim() ||
    post.user?.username ||
    "User";

  const likesCount = Array.isArray(post.likes) ? post.likes.length : 0;

  if (post.image) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={styles.gridCardMedia}
      >
        <Image source={{ uri: post.image }} style={styles.gridCardImage} resizeMode="cover" />
        <View style={styles.gridCardImageScrim}>
          <View style={styles.gridCardAuthorRow}>
            <Avatar uri={post.user?.profilePicture} size={18} />
            <Text style={styles.gridCardAuthorName} numberOfLines={1}>
              {authorName}
            </Text>
          </View>
          <View style={styles.gridCardLikeRow}>
            <Feather name="heart" size={11} color="#FFFFFF" />
            <Text style={styles.gridCardLikeCount}>{likesCount}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.gridCardText}>
      {post.content ? (
        <Text style={styles.gridCardTextContent} numberOfLines={4}>
          {post.content}
        </Text>
      ) : null}

      <View style={styles.gridCardTextFooter}>
        <View style={styles.gridCardAuthorRow}>
          <Avatar uri={post.user?.profilePicture} size={18} />
          <Text style={styles.gridCardAuthorNameMuted} numberOfLines={1}>
            {authorName}
          </Text>
        </View>
        <View style={styles.gridCardLikeRow}>
          <Feather name="heart" size={11} color="#9999A8" />
          <Text style={styles.gridCardLikeCountMuted}>{likesCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ============================================================================
// Styles (Circlee Hybrid Premium Design Language)
// ============================================================================
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#0D0D12",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#9999A8",
    marginTop: 2,
    fontWeight: "500",
  },
  filterIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#171720",
    borderWidth: 1,
    borderColor: "#30303C",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  filterIconButtonActive: {
    borderColor: "#8B5CF6",
    backgroundColor: "rgba(139, 92, 246, 0.15)",
  },
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 10,
    elevation: 2,
  },
  categoryScrollView: {
    marginVertical: 6,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#171720",
    borderWidth: 1,
    borderColor: "#30303C",
  },
  categoryChipActive: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderColor: "#8B5CF6",
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9999A8",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  exploreSection: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  sectionSubtitleBadge: {
    fontSize: 11,
    color: "#9999A8",
    fontWeight: "600",
    backgroundColor: "#171720",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#30303C",
  },
  trendingCardsScroll: {
    gap: 10,
    paddingRight: 16,
  },
  trendingCard: {
    width: 140,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#171720",
    borderWidth: 1,
    borderColor: "#30303C",
    justifyContent: "space-between",
  },
  trendingCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  trendingRankText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#A855F7",
  },
  trendingFireBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "rgba(168, 85, 247, 0.15)",
  },
  trendingFireText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#A855F7",
  },
  trendingTagName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  trendingCountText: {
    fontSize: 11,
    color: "#9999A8",
    fontWeight: "500",
  },
  suggestedUsersScroll: {
    gap: 10,
    paddingRight: 16,
  },
  suggestedUserCard: {
    width: 140,
    borderRadius: 18,
    backgroundColor: "#171720",
    borderWidth: 1,
    borderColor: "#30303C",
    padding: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  suggestedUserCardTop: {
    alignItems: "center",
    width: "100%",
  },
  suggestedUserName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 8,
    textAlign: "center",
  },
  suggestedUserHandle: {
    fontSize: 11,
    color: "#9999A8",
    marginTop: 1,
    textAlign: "center",
  },
  suggestedUserMutual: {
    fontSize: 10,
    color: "#8B5CF6",
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  suggestedFollowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#8B5CF6",
    marginTop: 10,
  },
  suggestedFollowBtnActive: {
    backgroundColor: "#191923",
    borderWidth: 1,
    borderColor: "#30303C",
  },
  suggestedFollowText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  suggestedFollowTextActive: {
    color: "#9999A8",
  },
  gridContainer: {
    flexDirection: "row",
    gap: GRID_GAP,
    marginTop: 4,
  },
  gridColumn: {
    flex: 1,
    gap: GRID_GAP,
  },
  gridCardMedia: {
    width: "100%",
    aspectRatio: 0.9,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#30303C",
    backgroundColor: "#171720",
    position: "relative",
  },
  gridCardImage: {
    width: "100%",
    height: "100%",
  },
  gridCardImageScrim: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: "rgba(13, 13, 18, 0.75)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gridCardAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  gridCardAuthorName: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
    flex: 1,
  },
  gridCardAuthorNameMuted: {
    fontSize: 11,
    color: "#9999A8",
    fontWeight: "600",
    flex: 1,
  },
  gridCardLikeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  gridCardLikeCount: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  gridCardLikeCountMuted: {
    fontSize: 10,
    color: "#9999A8",
    fontWeight: "600",
  },
  gridCardText: {
    width: "100%",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#171720",
    borderWidth: 1,
    borderColor: "#30303C",
    justifyContent: "space-between",
    minHeight: 120,
  },
  gridCardTextContent: {
    fontSize: 12,
    lineHeight: 17,
    color: "#FFFFFF",
    fontWeight: "500",
    marginBottom: 8,
  },
  gridCardTextFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
    paddingTop: 6,
  },
  emptyGridBox: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#171720",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#30303C",
    marginTop: 8,
  },
  emptyGridIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyGridTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  emptyGridSubtitle: {
    fontSize: 12,
    color: "#9999A8",
    textAlign: "center",
    lineHeight: 17,
  },
  // Search Mode Styles
  searchContentContainer: {
    paddingHorizontal: 16,
    marginTop: 6,
  },
  searchTabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  searchTabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#171720",
    borderWidth: 1,
    borderColor: "#30303C",
  },
  searchTabPillActive: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderColor: "#8B5CF6",
  },
  searchTabPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9999A8",
  },
  searchTabPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  sectionWrap: {
    marginBottom: 20,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionHeadingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionHeadingTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sectionCountText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9999A8",
  },
  searchUserRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  searchUserInfo: {
    flex: 1,
    marginLeft: 12,
  },
  searchUserName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  searchUserHandle: {
    fontSize: 12,
    color: "#9999A8",
    marginTop: 1,
  },
  searchHashtagRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  hashtagIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  searchHashtagName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  searchHashtagCount: {
    fontSize: 11,
    color: "#9999A8",
    marginTop: 1,
  },
  searchPostCard: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#171720",
    borderWidth: 1,
    borderColor: "#30303C",
    marginBottom: 10,
  },
  searchPostHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  searchPostAuthor: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  searchPostHandle: {
    fontSize: 11,
    color: "#9999A8",
    marginLeft: 6,
  },
  searchPostContent: {
    fontSize: 13,
    lineHeight: 18,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  searchPostThumbnail: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    marginBottom: 8,
  },
  searchPostMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  searchPostMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  searchPostMetaText: {
    fontSize: 11,
    color: "#9999A8",
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: "#9999A8",
  },
  emptyInline: {
    paddingVertical: 14,
  },
  emptyInlineText: {
    fontSize: 13,
    color: "#9999A8",
  },
  // Post Detail Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.82)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  postPreviewCard: {
    width: Math.min(SCREEN_WIDTH - 32, 380),
    borderRadius: 24,
    backgroundColor: "#171720",
    borderWidth: 1,
    borderColor: "#30303C",
    padding: 16,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  previewAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  previewAuthorName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  previewAuthorHandle: {
    fontSize: 12,
    color: "#9999A8",
  },
  previewCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  previewPostText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  previewPostImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 14,
    marginBottom: 12,
  },
  previewFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    paddingTop: 12,
    marginTop: 4,
  },
  previewStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  previewStatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  previewStatText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  previewProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  previewProfileBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Filter Sheet Styles
  filterSheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  filterSheetContainer: {
    backgroundColor: "#171720",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: "#30303C",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  filterSheetHeader: {
    alignItems: "center",
    marginBottom: 18,
  },
  filterSheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#30303C",
    marginBottom: 12,
  },
  filterSheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  filterSheetSubtitle: {
    fontSize: 12,
    color: "#9999A8",
    marginTop: 2,
  },
  filterOptionsList: {
    gap: 10,
    marginBottom: 20,
  },
  filterOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#191923",
    borderWidth: 1,
    borderColor: "#30303C",
  },
  filterOptionItemActive: {
    borderColor: "#8B5CF6",
    backgroundColor: "rgba(139, 92, 246, 0.12)",
  },
  filterOptionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  filterOptionLabelActive: {
    color: "#A855F7",
    fontWeight: "700",
  },
  filterOptionDesc: {
    fontSize: 11,
    color: "#9999A8",
    marginTop: 2,
  },
  filterCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
  },
  filterApplyBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
  },
  filterApplyBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default SearchScreen;
