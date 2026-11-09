import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";

interface ReactionPopupProps {
  visible: boolean;
  onClose: () => void;
  onSelectReaction: (emoji: string) => void;
  currentReaction?: string;
}

const REACTIONS = ["❤️", "🔥", "😂", "👍", "👏", "🎉"];

export const ReactionPopup: React.FC<ReactionPopupProps> = ({
  visible,
  onClose,
  onSelectReaction,
  currentReaction,
}) => {
  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [visible]);

  const handleSelect = (emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectReaction(emoji);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* Blur background */}
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />

          {/* Animating Reaction Container */}
          <Animated.View
            entering={ZoomIn.springify().mass(0.5).damping(10)}
            className="bg-chat-card/90 border border-chat-divider px-4 py-3 rounded-full flex-row items-center gap-3 shadow-2xl"
          >
            {REACTIONS.map((emoji) => {
              const isSelected = currentReaction === emoji;
              return (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => handleSelect(emoji)}
                  activeOpacity={0.6}
                  className={`p-1.5 rounded-full ${
                    isSelected ? "bg-chat-purple/40 border border-chat-purple" : "bg-chat-secondary/30"
                  }`}
                >
                  <Text className="text-2xl">{emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ReactionPopup;
