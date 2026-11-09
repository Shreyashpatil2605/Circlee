import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import Animated, {
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

export interface CustomAlertDialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: string;
  iconType?: "feather" | "material";
  type?: "danger" | "warning" | "info" | "success" | "purple";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  isDestructive?: boolean;
  buttons?: AlertButton[];
  dismissable?: boolean;
}

export const CustomAlertDialog: React.FC<CustomAlertDialogProps> = ({
  visible,
  onClose,
  title,
  description,
  icon,
  iconType = "feather",
  type = "purple",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
  buttons,
  dismissable = true,
}) => {
  const effectiveType = isDestructive ? "danger" : type;

  useEffect(() => {
    if (visible) {
      if (effectiveType === "danger") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  }, [visible, effectiveType]);

  if (!visible) return null;

  const handleBackdropPress = () => {
    if (dismissable) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (onCancel) onCancel();
      onClose();
    }
  };

  const handleCancelPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onCancel) onCancel();
    onClose();
  };

  const handleConfirmPress = () => {
    Haptics.impactAsync(
      isDestructive
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Medium
    );
    onClose();
    if (onConfirm) {
      setTimeout(() => {
        onConfirm();
      }, 100);
    }
  };

  const handleButtonPress = (btn: AlertButton) => {
    Haptics.impactAsync(
      btn.style === "destructive"
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Light
    );
    onClose();
    if (btn.onPress) {
      setTimeout(() => {
        btn.onPress!();
      }, 100);
    }
  };

  // Determine Icon & Colors based on type
  const getTypeConfig = () => {
    switch (effectiveType) {
      case "danger":
        return {
          defaultIcon: "trash-2",
          color: "#EF4444",
          bg: "rgba(239, 68, 68, 0.15)",
          border: "rgba(239, 68, 68, 0.3)",
          glow: "rgba(239, 68, 68, 0.15)",
          confirmBg: "#EF4444",
        };
      case "warning":
        return {
          defaultIcon: "alert-triangle",
          color: "#F59E0B",
          bg: "rgba(245, 158, 11, 0.15)",
          border: "rgba(245, 158, 11, 0.3)",
          glow: "rgba(245, 158, 11, 0.15)",
          confirmBg: "#F59E0B",
        };
      case "success":
        return {
          defaultIcon: "check-circle",
          color: "#10B981",
          bg: "rgba(16, 185, 129, 0.15)",
          border: "rgba(16, 185, 129, 0.3)",
          glow: "rgba(16, 185, 129, 0.15)",
          confirmBg: "#10B981",
        };
      case "info":
        return {
          defaultIcon: "info",
          color: "#00B0FF",
          bg: "rgba(0, 176, 255, 0.15)",
          border: "rgba(0, 176, 255, 0.3)",
          glow: "rgba(0, 176, 255, 0.15)",
          confirmBg: "#00B0FF",
        };
      case "purple":
      default:
        return {
          defaultIcon: "alert-circle",
          color: "#8B5CF6",
          bg: "rgba(139, 92, 246, 0.15)",
          border: "rgba(139, 92, 246, 0.3)",
          glow: "rgba(139, 92, 246, 0.15)",
          confirmBg: "#8B5CF6",
        };
    }
  };

  const config = getTypeConfig();
  const iconName = icon || config.defaultIcon;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleBackdropPress}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <BlurView
            intensity={45}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.darkDim} />

          <TouchableWithoutFeedback>
            <Animated.View
              entering={ZoomIn.springify().damping(18).mass(0.7)}
              exiting={ZoomOut.duration(150)}
              style={[
                styles.dialogContainer,
                {
                  shadowColor: config.color,
                },
              ]}
            >
              <BlurView intensity={90} tint="dark" style={styles.blurContent}>
                {/* Icon Badge */}
                <View
                  style={[
                    styles.iconBadge,
                    {
                      backgroundColor: config.bg,
                      borderColor: config.border,
                    },
                  ]}
                >
                  {iconType === "material" ? (
                    <MaterialCommunityIcons
                      name={iconName as any}
                      size={26}
                      color={config.color}
                    />
                  ) : (
                    <Feather
                      name={iconName as any}
                      size={24}
                      color={config.color}
                    />
                  )}
                </View>

                {/* Title */}
                <Text style={styles.title}>{title}</Text>

                {/* Description */}
                {description && (
                  <Text style={styles.description}>{description}</Text>
                )}

                {/* Action Buttons */}
                {buttons && buttons.length > 0 ? (
                  <View style={styles.customButtonsCol}>
                    {buttons.map((btn, index) => {
                      const isDestruct = btn.style === "destructive";
                      const isCancel = btn.style === "cancel";
                      return (
                        <TouchableOpacity
                          key={`${btn.text}-${index}`}
                          onPress={() => handleButtonPress(btn)}
                          activeOpacity={0.8}
                          style={[
                            styles.buttonBase,
                            isDestruct && styles.confirmDestructiveBtn,
                            isCancel && styles.cancelButton,
                            !isDestruct && !isCancel && styles.confirmPrimaryBtn,
                            index > 0 && { marginTop: 10 },
                          ]}
                        >
                          <Text
                            style={[
                              styles.buttonText,
                              isCancel && styles.cancelButtonText,
                              (isDestruct || (!isDestruct && !isCancel)) &&
                                styles.confirmButtonText,
                            ]}
                          >
                            {btn.text}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.buttonsRow}>
                    <TouchableOpacity
                      onPress={handleCancelPress}
                      activeOpacity={0.7}
                      style={[styles.buttonBase, styles.cancelButton]}
                    >
                      <Text
                        style={[styles.buttonText, styles.cancelButtonText]}
                      >
                        {cancelText}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleConfirmPress}
                      activeOpacity={0.8}
                      style={[
                        styles.buttonBase,
                        isDestructive
                          ? styles.confirmDestructiveBtn
                          : styles.confirmPrimaryBtn,
                      ]}
                    >
                      <Text
                        style={[styles.buttonText, styles.confirmButtonText]}
                      >
                        {confirmText}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </BlurView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "transparent",
  },
  darkDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 5, 10, 0.75)",
  },
  dialogContainer: {
    width: Math.min(SCREEN_WIDTH - 48, 360),
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    backgroundColor: "#14141C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 25,
  },
  blurContent: {
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    alignItems: "center",
    backgroundColor: "rgba(20, 20, 28, 0.95)",
  },
  iconBadge: {
    width: 58,
    height: 58,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 14,
    color: "#A1A1AA",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  buttonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 24,
    width: "100%",
  },
  customButtonsCol: {
    width: "100%",
    marginTop: 20,
  },
  buttonBase: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  confirmPrimaryBtn: {
    backgroundColor: "#8B5CF6",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  confirmDestructiveBtn: {
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  cancelButtonText: {
    color: "#D4D4D8",
  },
  confirmButtonText: {
    color: "#FFFFFF",
  },
});

export default CustomAlertDialog;
