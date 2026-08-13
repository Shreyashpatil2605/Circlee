import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { BlurView } from "expo-blur";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface ChatHeaderProps {
  onBackPress: () => void;
  onProfilePress?: () => void;
  onSearchPress?: () => void;
  onMorePress?: () => void;
  otherUser: {
    firstName?: string;
    lastName?: string;
    username?: string;
    profilePicture?: string;
    isOnline?: boolean;
  } | null;
  isTyping: boolean;
  lastSeenText?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onBackPress,
  onProfilePress,
  onSearchPress,
  onMorePress,
  otherUser,
  isTyping,
  lastSeenText = "Offline",
}) => {
  const fullName = otherUser
    ? `${otherUser.firstName || ""} ${otherUser.lastName || ""}`.trim()
    : "Chat";

  const isOnline = otherUser?.isOnline;

  const handleSearchPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onSearchPress) onSearchPress();
  };

  return (
    <View className="absolute top-0 left-0 right-0 z-50 overflow-hidden border-b border-chat-divider">
      <BlurView
        intensity={70}
        tint="dark"
        style={{ paddingHorizontal: 16, paddingTop: 40, paddingBottom: 14, backgroundColor: "rgba(11, 11, 18, 0.4)" }}
      >
        <View className="flex-row items-center justify-between">
          {/* Left Section: Back & Avatar */}
          <View className="flex-row items-center flex-1 mr-3">
            <TouchableOpacity
              onPress={onBackPress}
              activeOpacity={0.7}
              className="p-1.5 mr-2 rounded-full bg-chat-secondary/40"
            >
              <Feather name="arrow-left" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onProfilePress}
              activeOpacity={0.85}
              className="flex-row items-center flex-1"
            >
              <View className="relative">
                {otherUser?.profilePicture ? (
                  <Image
                    source={{ uri: otherUser.profilePicture }}
                    className="w-10 h-10 rounded-full border border-chat-purple/30"
                  />
                ) : (
                  <View className="w-10 h-10 rounded-full bg-chat-card items-center justify-center border border-chat-purple/30">
                    <Feather name="user" size={18} color="#A7A7B5" />
                  </View>
                )}
                {isOnline && (
                  <View className="absolute bottom-0 right-0 w-3 h-3 bg-chat-green rounded-full border-2 border-chat-bg shadow-sm" />
                )}
              </View>

              <View className="ml-3 flex-1">
                <View className="flex-row items-center">
                  <Text
                    className="text-chat-text-primary font-bold text-base"
                    numberOfLines={1}
                  >
                    {fullName}
                  </Text>
                  {/* Verified Badge mock */}
                  <View className="ml-1 bg-chat-purple/20 p-0.5 rounded-full">
                    <Feather name="check" size={10} color="#8D6CFF" />
                  </View>
                </View>

                {isTyping ? (
                  <Text className="text-chat-purple-light text-xs animate-pulse font-medium">
                    typing...
                  </Text>
                ) : isOnline ? (
                  <Text className="text-chat-green text-xs font-medium">Active Now</Text>
                ) : (
                  <Text className="text-chat-text-secondary text-xs" numberOfLines={1}>
                    {lastSeenText}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Right Section: Technology badge (Convex), Search & Menu */}
          <View className="flex-row items-center gap-2">
            {/* Convex Tech Badge */}
            <View className="bg-chat-purple/10 px-2 py-1 rounded-full border border-chat-purple/20 mr-1">
              <Text className="text-[10px] text-chat-purple-light font-bold uppercase tracking-wider">
                Convex
              </Text>
            </View>

            {/* Search Toggle Button */}
            <TouchableOpacity
              onPress={handleSearchPress}
              activeOpacity={0.7}
              className="p-1.5 rounded-full bg-chat-secondary/40"
            >
              <Feather name="search" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onMorePress}
              activeOpacity={0.7}
              className="p-1.5 rounded-full bg-chat-secondary/40"
            >
              <Feather name="more-vertical" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

export default ChatHeader;
