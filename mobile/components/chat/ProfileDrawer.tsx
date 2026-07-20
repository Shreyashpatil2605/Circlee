import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image, ScrollView, Dimensions, TouchableWithoutFeedback } from "react-native";
import Animated, { SlideInRight, SlideOutRight } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface ProfileDrawerProps {
  visible: boolean;
  onClose: () => void;
  otherUser: {
    firstName?: string;
    lastName?: string;
    username?: string;
    profilePicture?: string;
    isOnline?: boolean;
  } | null;
  bio?: string;
  mutualFriends?: number;
}

const { width } = Dimensions.get("window");

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  visible,
  onClose,
  otherUser,
  bio = "Digital Designer & Product Developer. Building Circleee mobile experiences.",
  mutualFriends = 12,
}) => {
  const [activeTab, setActiveTab] = useState<"media" | "links" | "docs">("media");

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [visible]);

  const handleTabPress = (tab: "media" | "links" | "docs") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const fullName = otherUser
    ? `${otherUser.firstName || ""} ${otherUser.lastName || ""}`.trim()
    : "Profile";

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Clickable transparent overlay on left */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1 bg-black/40" />
        </TouchableWithoutFeedback>

        {/* Sliding drawer */}
        <Animated.View
          entering={SlideInRight.springify().damping(18).mass(0.8)}
          exiting={SlideOutRight.duration(200)}
          style={styles.drawerContainer}
          className="border-l border-chat-divider overflow-hidden"
        >
          <BlurView
            intensity={90}
            tint="dark"
            style={{ flex: 1, paddingVertical: 40, paddingHorizontal: 20, backgroundColor: "rgba(11, 11, 18, 0.9)" }}
          >
            {/* Header: Close Button */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-chat-text-primary text-lg font-bold">Profile Info</Text>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                className="p-1.5 rounded-full bg-chat-secondary/60"
              >
                <Feather name="x" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              {/* Profile Card */}
              <View className="items-center mb-6">
                <View className="relative mb-4">
                  {otherUser?.profilePicture ? (
                    <Image
                      source={{ uri: otherUser.profilePicture }}
                      className="w-24 h-24 rounded-full border border-chat-purple/30"
                    />
                  ) : (
                    <View className="w-24 h-24 rounded-full bg-chat-card items-center justify-center border border-chat-purple/30">
                      <Feather name="user" size={40} color="#A7A7B5" />
                    </View>
                  )}
                  {otherUser?.isOnline && (
                    <View className="absolute bottom-0 right-1 w-5 h-5 bg-chat-green rounded-full border-4 border-chat-bg" />
                  )}
                </View>

                <View className="flex-row items-center">
                  <Text className="text-chat-text-primary text-xl font-bold">{fullName}</Text>
                  <View className="ml-1 bg-chat-purple/20 p-0.5 rounded-full">
                    <Feather name="check" size={10} color="#8D6CFF" />
                  </View>
                </View>
                <Text className="text-chat-text-secondary text-sm mt-1">@{otherUser?.username || "username"}</Text>
              </View>

              {/* Bio & Friends */}
              <View className="bg-chat-card/40 border border-chat-divider rounded-2xl p-4 mb-6">
                <Text className="text-chat-text-primary font-semibold mb-2">About</Text>
                <Text className="text-chat-text-secondary text-sm leading-5">{bio}</Text>
                
                <View className="h-[1px] bg-chat-divider my-3.5" />

                <View className="flex-row items-center justify-between">
                  <Text className="text-chat-text-secondary text-sm">Mutual Friends</Text>
                  <Text className="text-chat-text-primary font-bold">{mutualFriends} friends</Text>
                </View>
              </View>

              {/* Tabs Section */}
              <View className="flex-row border-b border-chat-divider mb-4">
                <TouchableOpacity
                  onPress={() => handleTabPress("media")}
                  className={`flex-1 pb-3 items-center ${activeTab === "media" ? "border-b-2 border-chat-purple" : ""}`}
                >
                  <Text className={`font-semibold text-sm ${activeTab === "media" ? "text-chat-purple-light" : "text-chat-text-secondary"}`}>
                    Media
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleTabPress("links")}
                  className={`flex-1 pb-3 items-center ${activeTab === "links" ? "border-b-2 border-chat-purple" : ""}`}
                >
                  <Text className={`font-semibold text-sm ${activeTab === "links" ? "text-chat-purple-light" : "text-chat-text-secondary"}`}>
                    Links
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleTabPress("docs")}
                  className={`flex-1 pb-3 items-center ${activeTab === "docs" ? "border-b-2 border-chat-purple" : ""}`}
                >
                  <Text className={`font-semibold text-sm ${activeTab === "docs" ? "text-chat-purple-light" : "text-chat-text-secondary"}`}>
                    Docs
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tab Content Mocks */}
              {activeTab === "media" && (
                <View className="flex-row flex-wrap gap-2">
                  <View className="w-[30%] aspect-square bg-chat-secondary rounded-lg border border-chat-divider items-center justify-center">
                    <Feather name="image" size={20} color="#A7A7B5" />
                  </View>
                  <View className="w-[30%] aspect-square bg-chat-secondary rounded-lg border border-chat-divider items-center justify-center">
                    <Feather name="image" size={20} color="#A7A7B5" />
                  </View>
                  <View className="w-[30%] aspect-square bg-chat-secondary rounded-lg border border-chat-divider items-center justify-center">
                    <Feather name="image" size={20} color="#A7A7B5" />
                  </View>
                </View>
              )}
              {activeTab === "links" && (
                <View className="gap-2">
                  <View className="flex-row items-center p-3 bg-chat-secondary/40 border border-chat-divider rounded-xl">
                    <Feather name="link" size={16} color="#8D6CFF" className="mr-3" />
                    <View className="flex-1">
                      <Text className="text-chat-text-primary text-sm font-semibold" numberOfLines={1}>circleee.app</Text>
                      <Text className="text-chat-text-secondary text-xs" numberOfLines={1}>https://circleee.app/chat-redesign</Text>
                    </View>
                  </View>
                </View>
              )}
              {activeTab === "docs" && (
                <View className="gap-2">
                  <View className="flex-row items-center p-3 bg-chat-secondary/40 border border-chat-divider rounded-xl">
                    <Feather name="file" size={16} color="#00B0FF" className="mr-3" />
                    <View className="flex-1">
                      <Text className="text-chat-text-primary text-sm font-semibold" numberOfLines={1}>chat_guidelines.pdf</Text>
                      <Text className="text-chat-text-secondary text-xs">2.4 MB • PDF</Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  drawerContainer: {
    width: width * 0.78,
    height: "100%",
  },
});

export default ProfileDrawer;
