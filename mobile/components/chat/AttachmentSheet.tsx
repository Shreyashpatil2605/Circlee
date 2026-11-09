import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  Image,
} from "react-native";
import Animated, {
  SlideInDown,
  SlideOutDown,
  ZoomIn,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const rocketImage = require("@/assets/images/coming-soon-rocket.jpg");

interface AttachmentSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption?: (option: string) => void;
}

interface AttachmentOption {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  message: string;
}

const ATTACHMENT_OPTIONS: AttachmentOption[] = [
  {
    label: "Camera",
    icon: "camera",
    color: "#8B5CF6",
    message: "Camera sharing is coming in a future update.",
  },
  {
    label: "Gallery",
    icon: "image",
    color: "#00E676",
    message: "Gallery sharing is coming in a future update.",
  },
  {
    label: "Document",
    icon: "file-text",
    color: "#00B0FF",
    message: "Document sharing is coming in a future update.",
  },
  {
    label: "Location",
    icon: "map-pin",
    color: "#FF5252",
    message: "Location sharing is coming in a future update.",
  },
  {
    label: "Voice",
    icon: "mic",
    color: "#FFB300",
    message: "Voice messages are coming in a future update.",
  },
  {
    label: "Contact",
    icon: "user",
    color: "#BA68C8",
    message: "Contact sharing is coming in a future update.",
  },
  {
    label: "Poll",
    icon: "bar-chart-2",
    color: "#00E5FF",
    message: "Poll creation is coming in a future update.",
  },
];

export const AttachmentSheet: React.FC<AttachmentSheetProps> = ({
  visible,
  onClose,
  onSelectOption,
}) => {
  const [activeComingSoon, setActiveComingSoon] = useState<AttachmentOption | null>(null);
  const isHandlingTapRef = useRef(false);

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      setActiveComingSoon(null);
      isHandlingTapRef.current = false;
    }
  }, [visible]);

  const handlePressOption = (opt: AttachmentOption) => {
    // Prevent duplicate triggers from repeated taps
    if (isHandlingTapRef.current || activeComingSoon) return;
    isHandlingTapRef.current = true;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (onSelectOption) {
      onSelectOption(opt.label);
    }

    setActiveComingSoon(opt);

    setTimeout(() => {
      isHandlingTapRef.current = false;
    }, 300);
  };

  const handleDismissDialog = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveComingSoon(null);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={activeComingSoon ? handleDismissDialog : onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop for bottom sheet */}
        <TouchableWithoutFeedback onPress={activeComingSoon ? handleDismissDialog : onClose}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>

        {/* Share Content Bottom Sheet */}
        <Animated.View
          entering={SlideInDown.springify().damping(15).mass(0.8)}
          exiting={SlideOutDown.duration(200)}
          style={styles.sheetContainer}
          className="border-t border-[#272733] rounded-t-3xl overflow-hidden"
        >
          <BlurView
            intensity={90}
            tint="dark"
            style={{
              paddingVertical: 24,
              paddingHorizontal: 20,
              backgroundColor: "rgba(11, 11, 16, 0.92)",
            }}
          >
            {/* Drag handle line */}
            <View className="w-10 h-1.5 bg-[#A1A1AA]/30 rounded-full mb-6 self-center" />

            <Text className="text-[#F5F5F7] text-lg font-bold mb-5 px-1">
              Share Content
            </Text>

            {/* 7-Option Grid */}
            <View className="flex-row flex-wrap justify-between gap-y-5 px-1">
              {ATTACHMENT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  onPress={() => handlePressOption(opt)}
                  activeOpacity={0.7}
                  style={{ width: "30%", alignItems: "center" }}
                >
                  <View
                    className="w-12 h-12 rounded-2xl items-center justify-center mb-2"
                    style={{
                      backgroundColor: `${opt.color}15`,
                      borderColor: `${opt.color}35`,
                      borderWidth: 1,
                    }}
                  >
                    <Feather name={opt.icon} size={20} color={opt.color} />
                  </View>
                  <Text className="text-[#A1A1AA] text-xs text-center font-medium">
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>
        </Animated.View>

        {/* "Dear User" Rocket Illustration Coming Soon Dialog */}
        {activeComingSoon && (
          <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
            {/* Dimmed Deep-Navy Blur Backdrop for dialog */}
            <TouchableWithoutFeedback onPress={handleDismissDialog}>
              <Animated.View
                entering={FadeIn.duration(180)}
                exiting={FadeOut.duration(150)}
                style={StyleSheet.absoluteFillObject}
              >
                <View
                  style={[
                    StyleSheet.absoluteFillObject,
                    { backgroundColor: "rgba(8, 14, 38, 0.82)" },
                  ]}
                />
                <BlurView
                  intensity={25}
                  tint="dark"
                  style={StyleSheet.absoluteFillObject}
                />
              </Animated.View>
            </TouchableWithoutFeedback>

            {/* Centered Rocket Card Modal */}
            <View style={styles.dialogCenterWrapper} pointerEvents="box-none">
              <Animated.View
                entering={ZoomIn.springify().mass(0.65).damping(13)}
                exiting={FadeOut.duration(150)}
                style={styles.dialogCard}
              >
                {/* Top Illustration: Rocket blasting off into starry night sky */}
                <View style={styles.rocketImageWrapper}>
                  <Image
                    source={rocketImage}
                    style={styles.rocketImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Bottom Content Area */}
                <View style={styles.dialogContent}>
                  <Text style={styles.dialogTitle}>Dear User</Text>

                  <Text style={styles.dialogMessage}>
                    {activeComingSoon.message}
                    {"\n"}
                    For more features and a better user experience, please upgrade this app.
                  </Text>

                  {/* Horizontal Divider */}
                  <View style={styles.divider} />

                  {/* Emerald / Teal Pill Button */}
                  <TouchableOpacity
                    onPress={handleDismissDialog}
                    activeOpacity={0.82}
                    style={styles.pillButton}
                  >
                    <Text style={styles.pillButtonText}>UPGRADE</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    width: "100%",
  },
  dialogCenterWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  dialogCard: {
    width: Math.min(SCREEN_WIDTH - 56, 300),
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#050814",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 20,
  },
  rocketImageWrapper: {
    width: "100%",
    height: 180,
    backgroundColor: "#0B1028",
    overflow: "hidden",
  },
  rocketImage: {
    width: "100%",
    height: "100%",
  },
  dialogContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "flex-start",
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "left",
  },
  dialogMessage: {
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    textAlign: "left",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    width: "100%",
    marginVertical: 18,
  },
  pillButton: {
    alignSelf: "center",
    backgroundColor: "#26B89A",
    paddingVertical: 10,
    paddingHorizontal: 36,
    borderRadius: 999,
    minWidth: 140,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#26B89A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  pillButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});

export default AttachmentSheet;
