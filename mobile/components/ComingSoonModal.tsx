import React from "react";
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
  ZoomIn,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface ComingSoonModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  featureName?: string;
  buttonText?: string;
  onAction?: () => void;
}

const rocketImage = require("@/assets/images/coming-soon-rocket.jpg");

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  visible,
  onClose,
  title = "Dear User",
  description,
  featureName,
  buttonText = "UPGRADE",
  onAction,
}) => {
  if (!visible) return null;

  const handleActionPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

  const handleBackdropPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const displayDescription =
    description ||
    (featureName
      ? `${featureName} is coming in a future update.\nFor more features and a better user experience, please upgrade this app.`
      : "For more features and a better user experience, please upgrade this app.");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Dimmed Deep-Navy Blurred Backdrop */}
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={StyleSheet.absoluteFillObject}
          >
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(8, 14, 38, 0.78)" }]} />
            <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFillObject} />
          </Animated.View>
        </TouchableWithoutFeedback>

        {/* Centered Modal Card */}
        <View style={styles.centerContainer} pointerEvents="box-none">
          <Animated.View
            entering={ZoomIn.springify().mass(0.65).damping(13)}
            exiting={FadeOut.duration(150)}
            style={styles.card}
          >
            {/* Top Illustration: Rocket blasting off from clouds into starry space */}
            <View style={styles.illustrationWrapper}>
              <Image
                source={rocketImage}
                style={styles.illustrationImage}
                resizeMode="cover"
              />
            </View>

            {/* Bottom Content Area */}
            <View style={styles.contentArea}>
              <Text style={styles.titleText}>{title}</Text>

              <Text style={styles.descriptionText}>
                {displayDescription}
              </Text>

              {/* Horizontal Divider */}
              <View style={styles.divider} />

              {/* Action Button: Emerald / Teal Pill */}
              <TouchableOpacity
                onPress={handleActionPress}
                activeOpacity={0.82}
                style={styles.pillButton}
              >
                <Text style={styles.pillButtonText}>{buttonText}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  card: {
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
  illustrationWrapper: {
    width: "100%",
    height: 180,
    backgroundColor: "#0B1028",
    overflow: "hidden",
  },
  illustrationImage: {
    width: "100%",
    height: "100%",
  },
  contentArea: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "flex-start",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "left",
  },
  descriptionText: {
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

export default ComingSoonModal;
