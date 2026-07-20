import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface PinnedMessageProps {
  content: string;
  onDismiss: () => void;
  onPress: () => void;
}

export const PinnedMessage: React.FC<PinnedMessageProps> = ({
  content,
  onDismiss,
  onPress,
}) => {
  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <View className="absolute top-[82] left-4 right-4 z-40 border border-chat-divider rounded-2xl overflow-hidden shadow-md">
      <BlurView
        intensity={70}
        tint="dark"
        style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "rgba(11, 11, 18, 0.5)" }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.8}
            className="flex-row items-center flex-1 mr-3"
          >
            <MaterialCommunityIcons name="pin" size={12} color="#8D6CFF" style={{ marginRight: 8 }} />
            <View className="flex-1">
              <Text className="text-chat-purple-light text-[10px] font-bold uppercase tracking-wider">
                Pinned Message
              </Text>
              <Text className="text-chat-text-primary text-xs mt-0.5" numberOfLines={1}>
                {content}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDismiss}
            activeOpacity={0.7}
            className="p-1 rounded-full bg-chat-secondary/60"
          >
            <Feather name="x" size={14} color="#A7A7B5" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

export default PinnedMessage;
