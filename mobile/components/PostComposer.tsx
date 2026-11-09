import React from "react";
import {
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { useCreatePost } from "@/hooks/useCreatePost";
import { useUser } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { tabNavigation } from "@/utils/tabNavigation";

export const PostComposer: React.FC = () => {
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
  const router = useRouter();

  const handleOpenOwnProfile = () => {
    tabNavigation.navigateToTab("profile");
    router.push("/(tabs)/profile");
  };

  const canPost = Boolean(content.trim() || selectedImage) && !isCreating;
  const avatarUrl =
    user?.imageUrl ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120";

  return (
    <View style={styles.cardContainer}>
      {/* Top Input Row */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={handleOpenOwnProfile}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open your profile"
        >
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Share something with your circle..."
            placeholderTextColor="#71717A"
            multiline
            value={content}
            onChangeText={setContent}
            maxLength={280}
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* Selected Image Preview */}
      {selectedImage && (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: selectedImage }}
            style={styles.previewImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={removeImage}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Remove attached image"
          >
            <Feather name="x" size={14} color="#F5F5F7" />
          </TouchableOpacity>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom Actions Row */}
      <View style={styles.bottomRow}>
        <View style={styles.attachmentGroup}>
          <TouchableOpacity
            style={styles.actionIconButton}
            onPress={pickImageFromGallery}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Attach photo from gallery"
          >
            <Feather name="image" size={17} color="#8B5CF6" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionIconButton}
            onPress={takePhoto}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Take photo with camera"
          >
            <Feather name="camera" size={17} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        <View style={styles.submitGroup}>
          {content.length > 0 && (
            <Text style={styles.charCounter}>
              {content.length}/280
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.postButton,
              canPost ? styles.postButtonActive : styles.postButtonDisabled,
            ]}
            onPress={createPost}
            disabled={!canPost}
            activeOpacity={0.8}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.postButtonText,
                  canPost
                    ? styles.postButtonTextActive
                    : styles.postButtonTextDisabled,
                ]}
              >
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: "#14141C",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#272733",
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1B1B25",
    borderWidth: 1.5,
    borderColor: "#272733",
    overflow: "hidden",
    marginRight: 12,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  inputWrapper: {
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
  },
  textInput: {
    fontSize: 15,
    lineHeight: 21,
    color: "#F5F5F7",
    paddingTop: 4,
    paddingBottom: 4,
    paddingHorizontal: 0,
  },
  previewContainer: {
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#272733",
    position: "relative",
    backgroundColor: "#1B1B25",
  },
  previewImage: {
    width: "100%",
    height: 180,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(20, 20, 28, 0.85)",
    borderWidth: 1,
    borderColor: "#272733",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#272733",
    opacity: 0.6,
    marginTop: 12,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  attachmentGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIconButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#1B1B25",
    borderWidth: 1,
    borderColor: "#272733",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  submitGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  charCounter: {
    fontSize: 12,
    color: "#71717A",
    marginRight: 10,
    fontVariant: ["tabular-nums"],
  },
  postButton: {
    paddingHorizontal: 18,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  postButtonActive: {
    backgroundColor: "#8B5CF6",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  postButtonDisabled: {
    backgroundColor: "#1B1B25",
    borderWidth: 1,
    borderColor: "#272733",
  },
  postButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  postButtonTextActive: {
    color: "#FFFFFF",
  },
  postButtonTextDisabled: {
    color: "#71717A",
  },
});

export const CreatePostComposer = PostComposer;
export default PostComposer;
