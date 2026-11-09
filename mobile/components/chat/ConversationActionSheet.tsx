import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback, Platform } from "react-native";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface ConversationActionSheetProps {
  visible: boolean;
  conversation: any;
  onClose: () => void;
  onPin: () => void;
  onMute: () => void;
  onDelete: () => void;
  onClearChat?: () => void;
}

export const ConversationActionSheet: React.FC<ConversationActionSheetProps> = ({
  visible,
  conversation,
  onClose,
  onPin,
  onMute,
  onDelete,
  onClearChat,
}) => {
  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [visible]);

  if (!visible || !conversation) return null;

  const handlePressAction = (callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    setTimeout(() => {
      callback();
    }, 100);
  };

  const displayName = conversation.otherUser
    ? `${conversation.otherUser.firstName || ""} ${conversation.otherUser.lastName || ""}`.trim() || conversation.otherUser.username || "Chat"
    : "Chat";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={StyleSheet.absoluteFillObject} />

          <Animated.View
            entering={SlideInDown.springify().damping(15).mass(0.8)}
            exiting={SlideOutDown.duration(200)}
            style={styles.sheetContainer}
            className="border-t border-chat-divider rounded-t-3xl overflow-hidden"
          >
            <BlurView
              intensity={90}
              tint="dark"
              style={{
                paddingTop: 16,
                paddingBottom: Platform.OS === "ios" ? 40 : 24,
                paddingHorizontal: 20,
                backgroundColor: "rgba(11, 11, 18, 0.9)",
              }}
            >
              <View className="w-10 h-1 bg-chat-text-secondary/30 rounded-full mb-4 self-center" />

              <Text className="text-chat-text-secondary text-sm font-semibold text-center mb-6" numberOfLines={1}>
                Options for {displayName}
              </Text>

              <View className="bg-chat-card/50 border border-chat-divider rounded-2xl overflow-hidden mb-4">
                <TouchableOpacity
                  onPress={() => handlePressAction(onPin)}
                  className="flex-row items-center px-5 py-4 border-b border-chat-divider/50"
                  activeOpacity={0.7}
                >
                  <View className="w-8 h-8 rounded-lg bg-chat-purple/15 items-center justify-center border border-chat-purple/30">
                    <Feather name="paperclip" size={16} color="#8D6CFF" />
                  </View>
                  <Text className="text-chat-text-primary text-base font-medium ml-4">
                    {conversation.isPinned ? "Unpin Chat" : "Pin Chat"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handlePressAction(onMute)}
                  className="flex-row items-center px-5 py-4 border-b border-chat-divider/50"
                  activeOpacity={0.7}
                >
                  <View className="w-8 h-8 rounded-lg bg-blue-500/15 items-center justify-center border border-blue-500/30">
                    <Feather name="bell-off" size={16} color="#00B0FF" />
                  </View>
                  <Text className="text-chat-text-primary text-base font-medium ml-4">Mute Notifications</Text>
                </TouchableOpacity>

                {onClearChat && (
                  <TouchableOpacity
                    onPress={() => handlePressAction(onClearChat)}
                    className="flex-row items-center px-5 py-4 border-b border-chat-divider/50"
                    activeOpacity={0.7}
                  >
                    <View className="w-8 h-8 rounded-lg bg-orange-500/15 items-center justify-center border border-orange-500/30">
                      <Feather name="message-square" size={16} color="#FF9100" />
                    </View>
                    <Text className="text-orange-400 text-base font-medium ml-4">Clear Chat</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => handlePressAction(onDelete)}
                  className="flex-row items-center px-5 py-4"
                  activeOpacity={0.7}
                >
                  <View className="w-8 h-8 rounded-lg bg-red-500/15 items-center justify-center border border-red-500/30">
                    <Feather name="trash-2" size={16} color="#FF3D00" />
                  </View>
                  <Text className="text-red-500 text-base font-semibold ml-4">Delete Chat</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    width: "100%",
  },
});

export default ConversationActionSheet;
