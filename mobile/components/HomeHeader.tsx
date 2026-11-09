import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import SignOutButton from "./SignOutButton";
import { tabNavigation } from "@/utils/tabNavigation";

interface HomeHeaderProps {
  rightAction?: React.ReactNode;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ rightAction }) => {
  const { user } = useUser();
  const router = useRouter();

  const avatarUrl =
    user?.imageUrl ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120";

  const handleOpenOwnProfile = () => {
    tabNavigation.navigateToTab("profile");
    router.push("/(tabs)/profile");
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        <View style={styles.logoBadge}>
          <Image
            source={require("../assets/images/circlee-symbol-square.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.logoText}>Circlee</Text>
      </View>

      <View style={styles.rightSection}>
        {rightAction !== undefined ? (
          rightAction
        ) : (
          <View style={styles.rightActionGroup}>
            <TouchableOpacity
              onPress={handleOpenOwnProfile}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Open your profile"
              style={styles.avatarButton}
            >
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <SignOutButton />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#0B0B10",
    borderBottomWidth: 1,
    borderBottomColor: "#272733",
    zIndex: 10,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#14141C",
    borderWidth: 1,
    borderColor: "#272733",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoImage: {
    width: 24,
    height: 24,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F5F5F7",
    letterSpacing: -0.5,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightActionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#1B1B25",
    borderWidth: 1.5,
    borderColor: "#272733",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
});

export default HomeHeader;
