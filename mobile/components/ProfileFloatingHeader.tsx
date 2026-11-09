import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

interface ProfileFloatingHeaderProps {
  user: {
    firstName?: string;
    lastName?: string;
    username?: string;
  };
  postCount: number;
  scrollY: Animated.Value;
  onBack: () => void;
}

export const ProfileFloatingHeader: React.FC<ProfileFloatingHeaderProps> = ({
  user,
  postCount,
  scrollY,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === "android" ? 12 : 20);
  const headerHeight = topInset + 54;

  // Smooth transition when scrolling past cover section (~110px)
  const stickyBgOpacity = scrollY.interpolate({
    inputRange: [20, 110],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const fullName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.username ||
      "Profile"
    : "Profile";

  const postCountText = `${postCount} ${postCount === 1 ? "Post" : "Posts"}`;

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack();
  };

  return (
    <View
      style={[styles.headerContainer, { height: headerHeight, paddingTop: topInset }]}
      pointerEvents="box-none"
    >
      {/* Layer 1: Sticky Background (transitions from transparent to dark glass as user scrolls past cover) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          styles.stickyBackground,
          { opacity: stickyBgOpacity },
        ]}
        pointerEvents="none"
      >
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFillObject} />
        <View style={styles.stickyDarkOverlay} />
        <View style={styles.stickyBottomBorder} />
      </Animated.View>

      {/* Layer 2: Header Content Row */}
      <View style={styles.headerContentRow}>
        {/* Circular Translucent Back Button with Glassmorphism */}
        <TouchableOpacity
          onPress={handleBackPress}
          activeOpacity={0.7}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <BlurView intensity={45} tint="dark" style={styles.backButtonBlur}>
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </BlurView>
        </TouchableOpacity>

        {/* User's Actual Name & Actual Post Count */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText} numberOfLines={1}>
            {fullName}
          </Text>
          <Text style={styles.subtitleText} numberOfLines={1}>
            {postCountText}
          </Text>
        </View>

        {/* Right balance spacer to ensure symmetric centering and spacing */}
        <View style={styles.rightSpacer} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 10,
  },
  stickyBackground: {
    overflow: "hidden",
  },
  stickyDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 15, 23, 0.90)",
  },
  stickyBottomBorder: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#272733",
  },
  headerContentRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 54,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.35)", // Circlee violet accent
    backgroundColor: "rgba(20, 20, 28, 0.65)", // Translucent dark glass
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6", // subtle violet glow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  backButtonBlur: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
    justifyContent: "center",
  },
  titleText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
    textShadowColor: "rgba(0, 0, 0, 0.85)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitleText: {
    color: "#D4D4D8",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 1,
    textShadowColor: "rgba(0, 0, 0, 0.85)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  rightSpacer: {
    width: 40,
  },
});

export default ProfileFloatingHeader;
