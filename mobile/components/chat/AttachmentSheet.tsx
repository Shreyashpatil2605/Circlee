import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback, Dimensions } from "react-native";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface AttachmentSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (option: string) => void;
}

const { height } = Dimensions.get("window");

const ATTACHMENT_OPTIONS = [
  { label: "Camera", icon: "camera" as const, color: "#6B4EFF" },
  { label: "Gallery", icon: "image" as const, color: "#00E676" },
  { label: "Document", icon: "file-text" as const, color: "#00B0FF" },
  { label: "Location", icon: "map-pin" as const, color: "#FF3D00" },
  { label: "Voice", icon: "mic" as const, color: "#FFC400" },
  { label: "Contact", icon: "user" as const, color: "#BA68C8" },
  { label: "Poll", icon: "bar-chart-2" as const, color: "#00E5FF" },
];

export const AttachmentSheet: React.FC<AttachmentSheetProps> = ({
  visible,
  onClose,
  onSelectOption,
}) => {
  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [visible]);

  const handlePressOption = (label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectOption(label);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* Transparent click-through background */}
          <View style={StyleSheet.absoluteFillObject} />

          {/* Animating sheet */}
          <Animated.View
            entering={SlideInDown.springify().damping(15).mass(0.8)}
            exiting={SlideOutDown.duration(200)}
            style={styles.sheetContainer}
            className="border-t border-chat-divider rounded-t-3xl overflow-hidden"
          >
            <BlurView
              intensity={90}
              tint="dark"
              style={{ paddingVertical: 24, paddingHorizontal: 20, backgroundColor: "rgba(11, 11, 18, 0.85)" }}
            >
              {/* Drag handle line */}
              <View className="w-10 h-1.5 bg-chat-text-secondary/30 rounded-full align-self-center mb-6 self-center" />

              <Text className="text-chat-text-primary text-lg font-bold mb-5 px-1">
                Share Content
              </Text>

              {/* Grid of options */}
              <View className="flex-row flex-wrap justify-between gap-y-5 px-1">
                {ATTACHMENT_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.label}
                    onPress={() => handlePressOption(opt.label)}
                    activeOpacity={0.7}
                    style={{ width: "30%", alignItems: "center" }}
                  >
                    <View
                      className="w-12 h-12 rounded-2xl items-center justify-center mb-2"
                      style={{ backgroundColor: `${opt.color}15`, borderColor: `${opt.color}35`, borderWidth: 1 }}
                    >
                      <Feather name={opt.icon} size={20} color={opt.color} />
                    </View>
                    <Text className="text-chat-text-secondary text-xs text-center font-medium">
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
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

export default AttachmentSheet;
