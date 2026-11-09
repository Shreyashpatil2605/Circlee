import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
  Linking,
  ActivityIndicator,
} from "react-native";
import Animated, {
  SlideInRight,
  SlideOutRight,
  ZoomIn,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useApiClient, userApi, postApi } from "@/utils/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { modalService } from "@/context/ModalContext";

interface ProfileDrawerProps {
  visible: boolean;
  onClose: () => void;
  otherUser: {
    _id?: string;
    clerkId?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    profilePicture?: string;
    isOnline?: boolean;
    bio?: string;
  } | null;
  conversationId?: string;
  messages?: any[];
}

const { width, height } = Dimensions.get("window");
const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  visible,
  onClose,
  otherUser,
  messages = [],
}) => {
  const router = useRouter();
  const api = useApiClient();
  const { currentUser } = useCurrentUser();

  const [activeTab, setActiveTab] = useState<"media" | "links" | "docs">("media");
  const [selectedPostPreview, setSelectedPostPreview] = useState<any>(null);
  const [isMutualFriendsModalVisible, setIsMutualFriendsModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [visible]);

  // 1. Fetch Real User Profile from database (Bio, Connections, Info)
  const targetUsername = otherUser?.username;
  const {
    data: profileResponse,
    isLoading: isProfileLoading,
  } = useQuery({
    queryKey: ["userProfile", targetUsername],
    queryFn: () =>
      targetUsername ? userApi.getUserProfile(api, targetUsername) : null,
    enabled: !!targetUsername && visible,
    staleTime: 1000 * 30, // 30s cache
  });

  const userProfile = profileResponse?.data?.user;

  // 2. Fetch Real User Posts for Media Tab
  const {
    data: postsResponse,
    isLoading: isPostsLoading,
  } = useQuery({
    queryKey: ["userPosts", targetUsername],
    queryFn: () =>
      targetUsername ? postApi.getUserPosts(api, targetUsername) : null,
    enabled: !!targetUsername && visible,
    staleTime: 1000 * 30,
  });

  const userPosts: any[] = useMemo(
    () => postsResponse?.data?.posts || [],
    [postsResponse?.data?.posts]
  );

  // Filter posts with valid images for Media Tab
  const mediaPosts = useMemo(() => {
    return userPosts.filter((post: any) => !!post.image);
  }, [userPosts]);

  // 3. Calculate Real Mutual Friends from database
  const { mutualFriendsList, mutualCount } = useMemo(() => {
    if (!currentUser || !userProfile) {
      return { mutualFriendsList: [], mutualCount: 0 };
    }

    const myFollowingSet = new Set(
      (currentUser?.following || []).map((u: any) =>
        typeof u === "string" ? u : u._id?.toString()
      )
    );

    // Combine other user's following and followers
    const targetConnections = [
      ...(userProfile?.following || []),
      ...(userProfile?.followers || []),
    ];

    const mutualMap = new Map<string, any>();
    targetConnections.forEach((u: any) => {
      const id = typeof u === "string" ? u : u._id?.toString();
      if (
        id &&
        id !== currentUser?._id?.toString() &&
        id !== userProfile?._id?.toString() &&
        myFollowingSet.has(id)
      ) {
        if (!mutualMap.has(id)) {
          mutualMap.set(id, u);
        }
      }
    });

    const list = Array.from(mutualMap.values());
    return { mutualFriendsList: list, mutualCount: list.length };
  }, [currentUser, userProfile]);

  // 4. Extract Real Links from conversation messages and posts
  const linksList = useMemo(() => {
    const collected: { url: string; title: string; source: string; domain: string }[] = [];
    const seen = new Set<string>();

    const addUrl = (rawUrl: string, source: string) => {
      const cleanUrl = rawUrl.trim();
      if (!cleanUrl || seen.has(cleanUrl)) return;
      seen.add(cleanUrl);

      let domain = cleanUrl;
      try {
        const parsed = new URL(cleanUrl);
        domain = parsed.hostname.replace(/^www\./, "");
      } catch {
        domain = cleanUrl.split("/")[2] || cleanUrl;
      }

      collected.push({
        url: cleanUrl,
        title: domain,
        domain,
        source,
      });
    };

    // Check conversation messages
    (messages || []).forEach((msg: any) => {
      if (msg.content) {
        const matches = msg.content.match(URL_REGEX);
        if (matches) {
          matches.forEach((url: string) => addUrl(url, "Chat"));
        }
      }
    });

    // Check user's posts
    userPosts.forEach((post: any) => {
      if (post.content) {
        const matches = post.content.match(URL_REGEX);
        if (matches) {
          matches.forEach((url: string) => addUrl(url, "Post"));
        }
      }
    });

    // Check bio
    if (userProfile?.bio) {
      const bioMatches = userProfile.bio.match(URL_REGEX);
      if (bioMatches) {
        bioMatches.forEach((url: string) => addUrl(url, "Bio"));
      }
    }

    return collected;
  }, [messages, userPosts, userProfile?.bio]);

  // 5. Extract Real Documents from conversation attachments
  const docsList = useMemo(() => {
    const docs: {
      id: string;
      name: string;
      url: string;
      ext: string;
      size?: string;
    }[] = [];

    (messages || []).forEach((msg: any) => {
      if (msg.attachments && Array.isArray(msg.attachments)) {
        msg.attachments.forEach((att: any, idx: number) => {
          const type = att.type?.toLowerCase() || "";
          const url = att.url || "";
          const isDocType =
            type === "document" ||
            type === "file" ||
            type === "pdf" ||
            url.endsWith(".pdf") ||
            url.endsWith(".doc") ||
            url.endsWith(".docx") ||
            url.endsWith(".txt") ||
            url.endsWith(".zip");

          if (isDocType && url) {
            const fileName =
              att.metadata?.fileName ||
              url.split("/").pop()?.split("?")[0] ||
              `Document_${idx + 1}`;
            const ext = fileName.split(".").pop()?.toUpperCase() || "FILE";
            const size = att.metadata?.fileSize
              ? `${(att.metadata.fileSize / 1024 / 1024).toFixed(1)} MB`
              : undefined;

            docs.push({
              id: `${msg._id}-${idx}`,
              name: fileName,
              url,
              ext,
              size,
            });
          }
        });
      }
    });

    return docs;
  }, [messages]);

  if (!visible) return null;

  // Dynamic Bio: If user has not added a bio, display "__"
  const rawBio = userProfile?.bio !== undefined ? userProfile.bio : otherUser?.bio;
  const displayBio = rawBio && rawBio.trim().length > 0 ? rawBio.trim() : "__";

  const fullName =
    userProfile?.firstName
      ? `${userProfile.firstName} ${userProfile.lastName || ""}`.trim()
      : otherUser
      ? `${otherUser.firstName || ""} ${otherUser.lastName || ""}`.trim()
      : "Profile";

  const displayUsername = userProfile?.username || otherUser?.username || "username";
  const avatarUri = userProfile?.profilePicture || otherUser?.profilePicture;
  const isUserOnline = userProfile?.isOnline ?? otherUser?.isOnline ?? false;

  // Navigation: Navigate to the selected user's profile screen
  const handleNavigateToProfile = (targetUserParam?: string) => {
    const un = targetUserParam || displayUsername;
    if (!un || un === "username") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    router.push(`/${un}`);
  };

  const handleTabPress = (tab: "media" | "links" | "docs") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleOpenLink = async (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        modalService.showToast("Cannot open link", "error");
      }
    } catch {
      modalService.showToast("Failed to open URL", "error");
    }
  };

  const handleOpenDocument = async (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Linking.openURL(url);
    } catch {
      modalService.showToast("Could not open document", "error");
    }
  };

  const handleMutualFriendsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (mutualCount > 0) {
      setIsMutualFriendsModalVisible(true);
    } else {
      modalService.showToast(`No mutual friends with @${displayUsername}`, "info");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Clickable transparent overlay on left */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Sliding drawer from right */}
        <Animated.View
          entering={SlideInRight.springify().damping(20).mass(0.8)}
          exiting={SlideOutRight.duration(200)}
          style={styles.drawerContainer}
        >
          <BlurView
            intensity={95}
            tint="dark"
            style={styles.drawerBlur}
          >
            {/* Header: Close Button */}
            <View style={styles.topHeaderRow}>
              <Text style={styles.topHeaderTitle}>Profile Info</Text>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 60 }}
            >
              {/* Profile Card – Clickable to navigate to user's profile */}
              <TouchableOpacity
                onPress={() => handleNavigateToProfile()}
                activeOpacity={0.8}
                style={styles.profileCard}
              >
                <View style={styles.avatarWrapper}>
                  {avatarUri ? (
                    <Image
                      source={{ uri: avatarUri }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Feather name="user" size={38} color="#A7A7B5" />
                    </View>
                  )}
                  {isUserOnline && <View style={styles.onlineDot} />}
                </View>

                <View style={styles.nameRow}>
                  <Text style={styles.fullNameText} numberOfLines={1}>
                    {fullName}
                  </Text>
                  <View style={styles.verifiedBadge}>
                    <Feather name="check" size={10} color="#8D6CFF" />
                  </View>
                </View>

                <Text style={styles.usernameText}>@{displayUsername}</Text>

                {/* Subtle View Profile indicator */}
                <View style={styles.viewProfilePill}>
                  <Text style={styles.viewProfilePillText}>View Profile</Text>
                  <Feather name="arrow-up-right" size={12} color="#8D6CFF" />
                </View>
              </TouchableOpacity>

              {/* Bio & Mutual Friends Card */}
              <View style={styles.infoCard}>
                <Text style={styles.sectionHeading}>About</Text>
                {isProfileLoading ? (
                  <ActivityIndicator size="small" color="#8B5CF6" style={{ marginVertical: 8 }} />
                ) : (
                  <Text style={styles.bioText}>{displayBio}</Text>
                )}

                <View style={styles.divider} />

                {/* Mutual Friends Section (Tappable with real count) */}
                <TouchableOpacity
                  onPress={handleMutualFriendsPress}
                  activeOpacity={0.7}
                  style={styles.mutualRow}
                >
                  <View style={styles.mutualLeft}>
                    <Feather name="users" size={15} color="#A1A1AA" />
                    <Text style={styles.mutualLabel}>Mutual Friends</Text>
                  </View>
                  <View style={styles.mutualRight}>
                    <Text style={styles.mutualCountText}>
                      {mutualCount} {mutualCount === 1 ? "friend" : "friends"}
                    </Text>
                    {mutualCount > 0 && (
                      <Feather name="chevron-right" size={15} color="#71717A" style={{ marginLeft: 4 }} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>

              {/* Tabs Section */}
              <View style={styles.tabBar}>
                <TouchableOpacity
                  onPress={() => handleTabPress("media")}
                  activeOpacity={0.7}
                  style={[styles.tabButton, activeTab === "media" && styles.tabButtonActive]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "media" ? styles.tabTextActive : styles.tabTextInactive,
                    ]}
                  >
                    Media {mediaPosts.length > 0 ? `(${mediaPosts.length})` : ""}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleTabPress("links")}
                  activeOpacity={0.7}
                  style={[styles.tabButton, activeTab === "links" && styles.tabButtonActive]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "links" ? styles.tabTextActive : styles.tabTextInactive,
                    ]}
                  >
                    Links {linksList.length > 0 ? `(${linksList.length})` : ""}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleTabPress("docs")}
                  activeOpacity={0.7}
                  style={[styles.tabButton, activeTab === "docs" && styles.tabButtonActive]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "docs" ? styles.tabTextActive : styles.tabTextInactive,
                    ]}
                  >
                    Docs {docsList.length > 0 ? `(${docsList.length})` : ""}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tab 1: Media Content (Real User Posts) */}
              {activeTab === "media" && (
                <View>
                  {isPostsLoading ? (
                    <View style={styles.loadingBox}>
                      <ActivityIndicator size="small" color="#8B5CF6" />
                    </View>
                  ) : mediaPosts.length === 0 ? (
                    <View style={styles.emptyState}>
                      <View style={styles.emptyIconCircle}>
                        <Feather name="image" size={24} color="#71717A" />
                      </View>
                      <Text style={styles.emptyTitle}>No media yet</Text>
                      <Text style={styles.emptySubtitle}>
                        Posts with images and media from @{displayUsername} will appear here.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.mediaGrid}>
                      {mediaPosts.map((post: any, idx: number) => (
                        <TouchableOpacity
                          key={post._id || `media-${idx}`}
                          onPress={() => setSelectedPostPreview(post)}
                          activeOpacity={0.8}
                          style={styles.mediaThumbnail}
                        >
                          <Image
                            source={{ uri: post.image }}
                            style={styles.mediaImage}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Tab 2: Links Content */}
              {activeTab === "links" && (
                <View>
                  {linksList.length === 0 ? (
                    <View style={styles.emptyState}>
                      <View style={styles.emptyIconCircle}>
                        <Feather name="link" size={24} color="#71717A" />
                      </View>
                      <Text style={styles.emptyTitle}>No links shared yet</Text>
                      <Text style={styles.emptySubtitle}>
                        Links shared in chat or profile posts will appear here.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.listCol}>
                      {linksList.map((link, idx) => (
                        <TouchableOpacity
                          key={`link-${idx}`}
                          onPress={() => handleOpenLink(link.url)}
                          activeOpacity={0.7}
                          style={styles.linkCard}
                        >
                          <View style={styles.linkIconCircle}>
                            <Feather name="external-link" size={15} color="#8D6CFF" />
                          </View>
                          <View style={styles.linkContent}>
                            <Text style={styles.linkDomain} numberOfLines={1}>
                              {link.domain}
                            </Text>
                            <Text style={styles.linkUrl} numberOfLines={1}>
                              {link.url}
                            </Text>
                          </View>
                          <Feather name="chevron-right" size={14} color="#71717A" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Tab 3: Docs Content */}
              {activeTab === "docs" && (
                <View>
                  {docsList.length === 0 ? (
                    <View style={styles.emptyState}>
                      <View style={styles.emptyIconCircle}>
                        <Feather name="file-text" size={24} color="#71717A" />
                      </View>
                      <Text style={styles.emptyTitle}>No documents shared yet</Text>
                      <Text style={styles.emptySubtitle}>
                        PDFs and documents sent in this conversation will appear here.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.listCol}>
                      {docsList.map((doc) => (
                        <TouchableOpacity
                          key={doc.id}
                          onPress={() => handleOpenDocument(doc.url)}
                          activeOpacity={0.7}
                          style={styles.docCard}
                        >
                          <View style={styles.docIconCircle}>
                            <Feather name="file" size={16} color="#00B0FF" />
                          </View>
                          <View style={styles.docContent}>
                            <Text style={styles.docName} numberOfLines={1}>
                              {doc.name}
                            </Text>
                            <Text style={styles.docMeta}>
                              {doc.size ? `${doc.size} • ` : ""}{doc.ext}
                            </Text>
                          </View>
                          <Feather name="download" size={14} color="#71717A" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </BlurView>
        </Animated.View>
      </View>

      {/* 6. Post Media Preview Modal */}
      {selectedPostPreview && (
        <Modal
          visible={!!selectedPostPreview}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedPostPreview(null)}
        >
          <View style={styles.previewBackdrop}>
            <TouchableWithoutFeedback onPress={() => setSelectedPostPreview(null)}>
              <View style={StyleSheet.absoluteFillObject} />
            </TouchableWithoutFeedback>

            <Animated.View
              entering={ZoomIn.springify().damping(18)}
              style={styles.previewCard}
            >
              <Image
                source={{ uri: selectedPostPreview.image }}
                style={styles.previewImage}
                resizeMode="cover"
              />

              <View style={styles.previewInfo}>
                {selectedPostPreview.content ? (
                  <Text style={styles.previewContentText} numberOfLines={3}>
                    {selectedPostPreview.content}
                  </Text>
                ) : null}

                <View style={styles.previewBtnRow}>
                  <TouchableOpacity
                    onPress={() => setSelectedPostPreview(null)}
                    style={styles.previewCloseBtn}
                  >
                    <Text style={styles.previewCloseText}>Close</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedPostPreview(null);
                      handleNavigateToProfile();
                    }}
                    style={styles.previewViewBtn}
                  >
                    <Text style={styles.previewViewText}>View on Profile</Text>
                    <Feather name="arrow-up-right" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}

      {/* 7. Mutual Friends Modal */}
      <Modal
        visible={isMutualFriendsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMutualFriendsModalVisible(false)}
      >
        <View style={styles.mutualBackdrop}>
          <TouchableWithoutFeedback onPress={() => setIsMutualFriendsModalVisible(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          <Animated.View
            entering={ZoomIn.springify().damping(18)}
            style={styles.mutualDialog}
          >
            <View style={styles.mutualDialogHeader}>
              <View style={styles.mutualBadgeIcon}>
                <Feather name="users" size={20} color="#8D6CFF" />
              </View>
              <Text style={styles.mutualDialogTitle}>Mutual Friends</Text>
              <Text style={styles.mutualDialogSubtitle}>
                {mutualCount} mutual connection{mutualCount === 1 ? "" : "s"} with @{displayUsername}
              </Text>
            </View>

            <ScrollView style={{ maxHeight: height * 0.4 }} showsVerticalScrollIndicator={false}>
              {mutualFriendsList.map((friend: any, index: number) => {
                const friendName = `${friend.firstName || ""} ${friend.lastName || ""}`.trim() || friend.username || "User";
                return (
                  <TouchableOpacity
                    key={friend._id || `friend-${index}`}
                    onPress={() => {
                      setIsMutualFriendsModalVisible(false);
                      if (friend.username) {
                        handleNavigateToProfile(friend.username);
                      }
                    }}
                    activeOpacity={0.7}
                    style={styles.friendRow}
                  >
                    {friend.profilePicture ? (
                      <Image source={{ uri: friend.profilePicture }} style={styles.friendAvatar} />
                    ) : (
                      <View style={styles.friendAvatarPlaceholder}>
                        <Feather name="user" size={18} color="#A7A7B5" />
                      </View>
                    )}

                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName} numberOfLines={1}>{friendName}</Text>
                      <Text style={styles.friendUsername} numberOfLines={1}>@{friend.username || "user"}</Text>
                    </View>

                    <Feather name="arrow-up-right" size={16} color="#8D6CFF" />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setIsMutualFriendsModalVisible(false)}
              style={styles.mutualDialogCloseBtn}
            >
              <Text style={styles.mutualDialogCloseText}>Done</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  drawerContainer: {
    width: width * 0.82,
    height: "100%",
    backgroundColor: "#14141C",
    borderLeftWidth: 1,
    borderLeftColor: "#272733",
    overflow: "hidden",
  },
  drawerBlur: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 20,
    backgroundColor: "rgba(11, 11, 18, 0.95)",
  },
  topHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  topHeaderTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  profileCard: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.4)",
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#1B1B25",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.4)",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#10B981",
    borderWidth: 3,
    borderColor: "#0B0B10",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fullNameText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    maxWidth: 180,
  },
  verifiedBadge: {
    marginLeft: 6,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    padding: 3,
    borderRadius: 10,
  },
  usernameText: {
    color: "#A1A1AA",
    fontSize: 13,
    marginTop: 2,
  },
  viewProfilePill: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.25)",
  },
  viewProfilePillText: {
    color: "#A78BFA",
    fontSize: 11,
    fontWeight: "700",
    marginRight: 4,
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "#272733",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  sectionHeading: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 6,
  },
  bioText: {
    color: "#A1A1AA",
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginVertical: 12,
  },
  mutualRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mutualLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mutualLabel: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "500",
  },
  mutualRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  mutualCountText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#272733",
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingBottom: 10,
    alignItems: "center",
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#8B5CF6",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#A78BFA",
    fontWeight: "700",
  },
  tabTextInactive: {
    color: "#71717A",
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  mediaThumbnail: {
    width: "31.2%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#272733",
    backgroundColor: "#1B1B25",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  listCol: {
    gap: 8,
  },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "#272733",
  },
  linkIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  linkContent: {
    flex: 1,
    marginRight: 6,
  },
  linkDomain: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  linkUrl: {
    color: "#A1A1AA",
    fontSize: 11,
    marginTop: 1,
  },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "#272733",
  },
  docIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(0, 176, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  docContent: {
    flex: 1,
    marginRight: 6,
  },
  docName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  docMeta: {
    color: "#A1A1AA",
    fontSize: 11,
    marginTop: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptySubtitle: {
    color: "#71717A",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
  loadingBox: {
    paddingVertical: 30,
    alignItems: "center",
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  previewCard: {
    width: Math.min(width - 32, 360),
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#14141C",
    borderWidth: 1,
    borderColor: "#272733",
  },
  previewImage: {
    width: "100%",
    aspectRatio: 1,
  },
  previewInfo: {
    padding: 16,
  },
  previewContentText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  previewBtnRow: {
    flexDirection: "row",
    gap: 10,
  },
  previewCloseBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
  },
  previewCloseText: {
    color: "#D4D4D8",
    fontWeight: "600",
    fontSize: 13,
  },
  previewViewBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
  },
  previewViewText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  mutualBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  mutualDialog: {
    width: Math.min(width - 32, 360),
    borderRadius: 26,
    padding: 20,
    backgroundColor: "#14141C",
    borderWidth: 1,
    borderColor: "#272733",
  },
  mutualDialogHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  mutualBadgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  mutualDialogTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  mutualDialogSubtitle: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: 2,
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  friendAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1B1B25",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  friendUsername: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: 1,
  },
  mutualDialogCloseBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
  },
  mutualDialogCloseText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});

export default ProfileDrawer;
