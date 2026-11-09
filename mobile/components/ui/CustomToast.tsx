import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import Animated, {
  SlideInUp,
  SlideOutUp,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export type ToastType = "success" | "error" | "info" | "warning";

export interface CustomToastProps {
  visible: boolean;
  message: string;
  title?: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
  position?: "top" | "bottom";
}

export const CustomToast: React.FC<CustomToastProps> = ({
  visible,
  message,
  title,
  type = "info",
  duration = 3200,
  onDismiss,
  position = "top",
}) => {
  const insets = useSafeAreaInsets();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      if (type === "success") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === "error") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      if (duration > 0) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          onDismiss();
        }, duration);
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, duration, type, onDismiss]);

  if (!visible) return null;

  const getTypeConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: "check",
          color: "#10B981",
          bg: "rgba(16, 185, 129, 0.15)",
          border: "rgba(16, 185, 129, 0.3)",
        };
      case "error":
        return {
          icon: "alert-circle",
          color: "#EF4444",
          bg: "rgba(239, 68, 68, 0.15)",
          border: "rgba(239, 68, 68, 0.3)",
        };
      case "warning":
        return {
          icon: "alert-triangle",
          color: "#F59E0B",
          bg: "rgba(245, 158, 11, 0.15)",
          border: "rgba(245, 158, 11, 0.3)",
        };
      case "info":
      default:
        return {
          icon: "info",
          color: "#8B5CF6",
          bg: "rgba(139, 92, 246, 0.15)",
          border: "rgba(139, 92, 246, 0.3)",
        };
    }
  };

  const config = getTypeConfig();

  const topOffset = Math.max(insets.top, Platform.OS === "android" ? 24 : 12) + 8;
  const bottomOffset = Math.max(insets.bottom, 16) + 16;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        position === "top"
          ? { top: topOffset }
          : { bottom: bottomOffset, justifyContent: "flex-end" },
      ]}
    >
      <Animated.View
        entering={SlideInUp.springify().damping(18).mass(0.7)}
        exiting={SlideOutUp.duration(180)}
        style={[
          styles.container,
          {
            borderColor: "rgba(255, 255, 255, 0.12)",
            shadowColor: config.color,
          },
        ]}
      >
        <BlurView intensity={85} tint="dark" style={styles.blurContent}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onDismiss();
            }}
            style={styles.innerRow}
          >
            {/* Leading Icon Circle */}
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: config.bg,
                  borderColor: config.border,
                },
              ]}
            >
              <Feather name={config.icon as any} size={15} color={config.color} />
            </View>

            {/* Message Body */}
            <View style={styles.textContainer}>
              {title && <Text style={styles.title}>{title}</Text>}
              <Text
                style={[styles.message, !title && styles.messageSolo]}
                numberOfLines={2}
              >
                {message}
              </Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onDismiss();
              }}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={14} color="#71717A" />
            </TouchableOpacity>
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999999,
  },
  container: {
    width: Math.min(SCREEN_WIDTH - 32, 400),
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    backgroundColor: "#14141C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 20,
  },
  blurContent: {
    backgroundColor: "rgba(20, 20, 28, 0.94)",
  },
  innerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.1,
  },
  message: {
    fontSize: 12,
    color: "#A1A1AA",
    marginTop: 1,
    lineHeight: 16,
  },
  messageSolo: {
    fontSize: 13,
    fontWeight: "600",
    color: "#F5F5F7",
  },
  closeBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
});

export default CustomToast;
