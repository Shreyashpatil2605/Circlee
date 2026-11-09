import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useComments } from "@/hooks/useComments";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Post } from "@/types";

interface CommentsModalProps {
  selectedPost: Post;
  onClose: () => void;
  highlightCommentId?: string;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  selectedPost,
  onClose,
  highlightCommentId,
}) => {
  const {
    commentText,
    setCommentText,
    createComment,
    deleteComment,
    isCreatingComment,
    isDeletingComment,
  } = useComments();

  const { currentUser } = useCurrentUser();
  const scrollViewRef = useRef<ScrollView>(null);

  const keyboard = useAnimatedKeyboard({
    isStatusBarTranslucentAndroid: true,
    isNavigationBarTranslucentAndroid: true,
  });

  const [fallbackKeyboardHeight, setFallbackKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setFallbackKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setFallbackKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const animatedAvoidingStyle = useAnimatedStyle(() => {
    const height = Math.max(keyboard.height.value, fallbackKeyboardHeight);
    return {
      paddingBottom: height,
    };
  }, [fallbackKeyboardHeight]);

  const handleClose = useCallback(() => {
    onClose();
    setCommentText("");
  }, [onClose, setCommentText]);

  // 1. Android Hardware Back Button Handler: Closes modal cleanly without exiting app
  useEffect(() => {
    if (!selectedPost) return;

    const onBackPress = () => {
      handleClose();
      return true; // Prevents default behavior (exiting the application)
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => {
      backHandlerSubscription.remove();
    };
  }, [selectedPost, handleClose]);

  const handleCreateComment = async () => {
    if (!commentText.trim() || isCreatingComment || !selectedPost?._id) return;
    await createComment(selectedPost._id);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const userAvatar =
    currentUser?.profilePicture ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120";

  if (!selectedPost) {
    return null;
  }

  return (
    <Modal
      visible={Boolean(selectedPost)}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close comments"
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Comments</Text>

          <View style={styles.headerRightSpacer} />
        </View>

        {/* Animated container dynamically lifts the input immediately above the soft keyboard */}
        <Animated.View style={[styles.avoidingContainer, animatedAvoidingStyle]}>
          {/* Scrollable Feed Post + Comments List */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Original Post Summary */}
            <View style={styles.postSection}>
              <View style={styles.avatarCol}>
                <Image
                  source={{ uri: selectedPost.user?.profilePicture || userAvatar }}
                  style={styles.authorAvatar}
                />
              </View>

              <View style={styles.postBodyCol}>
                <View style={styles.authorMetaRow}>
                  <Text style={styles.authorName}>
                    {selectedPost.user?.firstName || "User"}{" "}
                    {selectedPost.user?.lastName || ""}
                  </Text>
                  {Boolean(selectedPost.user?.username) && (
                    <Text style={styles.authorUsername}>
                      @{selectedPost.user?.username}
                    </Text>
                  )}
                </View>

                {Boolean(selectedPost.content) && (
                  <Text style={styles.postContent}>{selectedPost.content}</Text>
                )}

                {Boolean(selectedPost.image) && (
                  <Image
                    source={{ uri: selectedPost.image }}
                    style={styles.postMedia}
                    resizeMode="cover"
                  />
                )}
              </View>
            </View>

            {/* Divider */}
            <View style={styles.sectionDivider} />

            {/* Comments List */}
            {selectedPost.comments && selectedPost.comments.length > 0 ? (
              selectedPost.comments
                .filter((comment) => Boolean(comment && comment._id))
                .map((comment) => {
                  const isHighlight = comment._id === highlightCommentId;
                  const isAuthor = Boolean(
                    currentUser?._id &&
                      comment.user?._id &&
                      currentUser._id.toString() === comment.user._id.toString()
                  );

                  return (
                    <View
                      key={comment._id}
                      style={[
                        styles.commentItem,
                        isHighlight && styles.highlightComment,
                      ]}
                    >
                      <Image
                        source={{
                          uri:
                            comment.user?.profilePicture ||
                            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120",
                        }}
                        style={styles.commentAvatar}
                      />

                      <View style={styles.commentBodyCol}>
                        <View style={styles.commentHeaderRow}>
                          <View style={styles.commentAuthorRow}>
                            <Text style={styles.commentAuthorName}>
                              {comment.user?.firstName || "User"}{" "}
                              {comment.user?.lastName || ""}
                            </Text>
                            {Boolean(comment.user?.username) && (
                              <Text style={styles.commentAuthorHandle}>
                                @{comment.user?.username}
                              </Text>
                            )}
                          </View>

                          {isAuthor && (
                            <TouchableOpacity
                              onPress={() => {
                                if (comment._id) deleteComment(comment._id);
                              }}
                              disabled={isDeletingComment}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              style={styles.deleteCommentBtn}
                              accessibilityRole="button"
                              accessibilityLabel="Delete comment"
                            >
                              <Feather
                                name="trash-2"
                                size={15}
                                color={isDeletingComment ? "#71717A" : "#EF4444"}
                              />
                            </TouchableOpacity>
                          )}
                        </View>

                        <Text style={styles.commentContent}>{comment.content}</Text>
                      </View>
                    </View>
                  );
                })
            ) : (
              <View style={styles.emptyContainer}>
                <Feather name="message-square" size={32} color="#71717A" />
                <Text style={styles.emptyText}>No comments yet</Text>
                <Text style={styles.emptySubtext}>Start the conversation below</Text>
              </View>
            )}
          </ScrollView>

          {/* Fixed Bottom Input Bar - Remains visible immediately above the keyboard */}
          <View style={styles.inputBarWrapper}>
            <Image source={{ uri: userAvatar }} style={styles.inputUserAvatar} />

            <View style={styles.inputInnerWrapper}>
              <TextInput
                style={styles.inputField}
                placeholder="Write your comment..."
                placeholderTextColor="#71717A"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
                textAlignVertical="center"
              />

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  commentText.trim()
                    ? styles.submitButtonActive
                    : styles.submitButtonDisabled,
                ]}
                onPress={handleCreateComment}
                disabled={isCreatingComment || !commentText.trim()}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Submit reply"
              >
                {isCreatingComment ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Feather
                    name="arrow-up"
                    size={18}
                    color={commentText.trim() ? "#FFFFFF" : "#71717A"}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0B10",
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#272733",
    backgroundColor: "#0B0B10",
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  closeText: {
    color: "#8B5CF6",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#F5F5F7",
  },
  headerRightSpacer: {
    width: 44,
  },
  avoidingContainer: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  postSection: {
    flexDirection: "row",
    padding: 16,
  },
  avatarCol: {
    marginRight: 12,
  },
  authorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1B1B25",
    borderWidth: 1,
    borderColor: "#272733",
  },
  postBodyCol: {
    flex: 1,
  },
  authorMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  authorName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F5F5F7",
    marginRight: 6,
  },
  authorUsername: {
    fontSize: 13,
    color: "#71717A",
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: "#F5F5F7",
    marginBottom: 8,
  },
  postMedia: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#272733",
    marginTop: 6,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#272733",
    marginHorizontal: 16,
    marginVertical: 4,
  },
  commentItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(39, 39, 51, 0.4)",
  },
  highlightComment: {
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    borderLeftWidth: 3,
    borderLeftColor: "#8B5CF6",
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1B1B25",
    borderWidth: 1,
    borderColor: "#272733",
    marginRight: 12,
  },
  commentBodyCol: {
    flex: 1,
  },
  commentHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  commentAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F5F5F7",
    marginRight: 6,
  },
  commentAuthorHandle: {
    fontSize: 12,
    color: "#71717A",
  },
  deleteCommentBtn: {
    padding: 2,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    color: "#D4D4D8",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#F5F5F7",
  },
  emptySubtext: {
    fontSize: 13,
    color: "#71717A",
  },
  inputBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#14141C",
    borderTopWidth: 1,
    borderTopColor: "#272733",
  },
  inputUserAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1B1B25",
    borderWidth: 1,
    borderColor: "#272733",
    marginRight: 10,
  },
  inputInnerWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B1B25",
    borderWidth: 1,
    borderColor: "#272733",
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    color: "#F5F5F7",
    minHeight: 36,
    maxHeight: 90,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  submitButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  submitButtonActive: {
    backgroundColor: "#8B5CF6",
  },
  submitButtonDisabled: {
    backgroundColor: "transparent",
  },
});

export default CommentsModal;
