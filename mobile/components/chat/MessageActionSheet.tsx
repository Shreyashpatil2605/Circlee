import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback, Platform } from "react-native";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface MessageActionSheetProps {
  visible: boolean;
  onClose: () => void;
  message: {
    _id: string;
    content: string;
    createdAt: number;
    senderId: string;
    type?: string;
    attachments?: { type: string; url: string; metadata?: any }[];
  } | null;
  onSelectReaction: (emoji: string) => void;
  onReply: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

const REACTIONS = ["❤️", "🔥", "😂", "👍", "👏", "🎉"];

export const MessageActionSheet: React.FC<MessageActionSheetProps> = ({
  visible,
  onClose,
  message,
  onSelectReaction,
  onReply,
  onCopy,
  onDelete,
}) => {
  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [visible]);

  if (!visible || !message) return null;

  const isVoiceMessage =
    message.type === "voice" ||
    message.content?.startsWith("[Voice Message]") ||
    (message.attachments && (message.attachments as any[]).some((a) => a.type === "voice"));

  const handleSelectReaction = (emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectReaction(emoji);
    onClose();
  };

  const handlePressAction = (callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    setTimeout(() => {
      callback();
    }, 100);
  };

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
              <View className="w-10 h-1 bg-chat-text-secondary/30 rounded-full mb-6 self-center" />

              <View className="flex-row justify-between mb-6 px-2">
                {REACTIONS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => handleSelectReaction(emoji)}
                    activeOpacity={0.6}
                    className="w-12 h-12 rounded-full bg-chat-secondary/40 items-center justify-center border border-chat-divider/30"
                  >
                    <Text className="text-2xl">{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="bg-chat-card/50 border border-chat-divider rounded-2xl overflow-hidden mb-2">
                <TouchableOpacity
                  onPress={() => handlePressAction(onReply)}
                  className="flex-row items-center px-5 py-4 border-b border-chat-divider/50"
                  activeOpacity={0.7}
                >
                  <View className="w-8 h-8 rounded-lg bg-chat-purple/15 items-center justify-center border border-chat-purple/30">
                    <Feather name="corner-up-left" size={16} color="#8D6CFF" />
                  </View>
                  <Text className="text-chat-text-primary text-base font-medium ml-4">Reply</Text>
                </TouchableOpacity>

                {!isVoiceMessage && (
                  <TouchableOpacity
                    onPress={() => handlePressAction(onCopy)}
                    className="flex-row items-center px-5 py-4 border-b border-chat-divider/50"
                    activeOpacity={0.7}
                  >
                    <View className="w-8 h-8 rounded-lg bg-blue-500/15 items-center justify-center border border-blue-500/30">
                      <Feather name="copy" size={16} color="#00B0FF" />
                    </View>
                    <Text className="text-chat-text-primary text-base font-medium ml-4">Copy Text</Text>
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
                  <Text className="text-red-500 text-base font-semibold ml-4">Delete</Text>
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

export default MessageActionSheet;
