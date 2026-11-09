import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  PanResponder,
  Animated as AnimatedRN,
} from "react-native";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

export interface BottomSheetAction {
  id?: string;
  label: string;
  sublabel?: string;
  icon?: string;
  iconType?: "feather" | "material";
  iconColor?: string;
  iconBg?: string;
  isDestructive?: boolean;
  disabled?: boolean;
  showChevron?: boolean;
  onPress: () => void;
}

export interface CustomBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  headerIcon?: string;
  headerIconType?: "feather" | "material";
  headerIconColor?: string;
  headerIconBg?: string;
  actions?: BottomSheetAction[];
  children?: React.ReactNode;
  showDragHandle?: boolean;
  showCloseButton?: boolean;
  cancelButtonText?: string;
}

export const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({
  visible,
  onClose,
  title,
  description,
  headerIcon,
  headerIconType = "feather",
  headerIconColor = "#8B5CF6",
  headerIconBg = "rgba(139, 92, 246, 0.15)",
  actions = [],
  children,
  showDragHandle = true,
  showCloseButton = false,
  cancelButtonText,
}) => {
  const insets = useSafeAreaInsets();
  const panY = useRef(new AnimatedRN.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      panY.setValue(0);
    }
  }, [visible, panY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 12;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.8) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onClose();
        } else {
          AnimatedRN.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  const handleActionPress = (action: BottomSheetAction) => {
    if (action.disabled) return;
    Haptics.impactAsync(
      action.isDestructive
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light
    );
    onClose();
    setTimeout(() => {
      action.onPress();
    }, 150);
  };

  const renderIcon = (action: BottomSheetAction) => {
    if (!action.icon) return null;
    const color =
      action.iconColor || (action.isDestructive ? "#EF4444" : "#8B5CF6");
    const bg =
      action.iconBg ||
      (action.isDestructive
        ? "rgba(239, 68, 68, 0.12)"
        : "rgba(139, 92, 246, 0.12)");
    const borderColor = action.isDestructive
      ? "rgba(239, 68, 68, 0.25)"
      : "rgba(139, 92, 246, 0.25)";

    return (
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {action.iconType === "material" ? (
          <MaterialCommunityIcons name={action.icon as any} size={18} color={color} />
        ) : (
          <Feather name={action.icon as any} size={18} color={color} />
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.darkDim} />

          <TouchableWithoutFeedback>
            <AnimatedRN.View
              style={{
                transform: [{ translateY: panY }],
                width: "100%",
              }}
              {...panResponder.panHandlers}
            >
              <Animated.View
                entering={SlideInDown.springify().damping(20).mass(0.8)}
                exiting={SlideOutDown.duration(200)}
                style={styles.sheetContainer}
              >
                <BlurView
                  intensity={90}
                  tint="dark"
                  style={[
                    styles.blurContent,
                    { paddingBottom: Math.max(insets.bottom, 20) + 8 },
                  ]}
                >
                  {/* Drag Handle */}
                  {showDragHandle && (
                    <View style={styles.dragHandle} />
                  )}

                  {/* Header */}
                  {(title || description || headerIcon) && (
                    <View style={styles.header}>
                      {headerIcon && (
                        <View
                          style={[
                            styles.headerIconContainer,
                            {
                              backgroundColor: headerIconBg,
                              borderColor: `${headerIconColor}40`,
                            },
                          ]}
                        >
                          {headerIconType === "material" ? (
                            <MaterialCommunityIcons
                              name={headerIcon as any}
                              size={22}
                              color={headerIconColor}
                            />
                          ) : (
                            <Feather
                              name={headerIcon as any}
                              size={22}
                              color={headerIconColor}
                            />
                          )}
                        </View>
                      )}
                      {title && <Text style={styles.title}>{title}</Text>}
                      {description && (
                        <Text style={styles.description}>{description}</Text>
                      )}
                      {showCloseButton && (
                        <TouchableOpacity
                          onPress={onClose}
                          style={styles.closeButton}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Feather name="x" size={18} color="#A7A7B5" />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* Actions list */}
                  {actions.length > 0 && (
                    <View style={styles.actionsContainer}>
                      {actions.map((action, index) => {
                        const isLast = index === actions.length - 1;
                        return (
                          <TouchableOpacity
                            key={action.id || `${action.label}-${index}`}
                            onPress={() => handleActionPress(action)}
                            activeOpacity={0.7}
                            disabled={action.disabled}
                            style={[
                              styles.actionRow,
                              !isLast && styles.actionDivider,
                              action.disabled && { opacity: 0.5 },
                            ]}
                          >
                            <View style={styles.actionLeft}>
                              {renderIcon(action)}
                              <View style={styles.actionTextCol}>
                                <Text
                                  style={[
                                    styles.actionLabel,
                                    action.isDestructive &&
                                      styles.actionLabelDestructive,
                                  ]}
                                  numberOfLines={1}
                                >
                                  {action.label}
                                </Text>
                                {action.sublabel && (
                                  <Text
                                    style={styles.actionSublabel}
                                    numberOfLines={1}
                                  >
                                    {action.sublabel}
                                  </Text>
                                )}
                              </View>
                            </View>

                            {action.showChevron && (
                              <Feather
                                name="chevron-right"
                                size={18}
                                color="#71717A"
                              />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {/* Custom children */}
                  {children}

                  {/* Optional Cancel button */}
                  {cancelButtonText && (
                    <TouchableOpacity
                      onPress={onClose}
                      activeOpacity={0.8}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.cancelButtonText}>
                        {cancelButtonText}
                      </Text>
                    </TouchableOpacity>
                  )}
                </BlurView>
              </Animated.View>
            </AnimatedRN.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  darkDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 5, 10, 0.7)",
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "#14141C",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 20,
  },
  blurContent: {
    paddingTop: 12,
    paddingHorizontal: 20,
    backgroundColor: "rgba(20, 20, 28, 0.96)",
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 13,
    color: "#A1A1AA",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  closeButton: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  actionsContainer: {
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "#272733",
    overflow: "hidden",
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  actionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  actionTextCol: {
    marginLeft: 14,
    flex: 1,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#F5F5F7",
    letterSpacing: 0.1,
  },
  actionLabelDestructive: {
    color: "#EF4444",
  },
  actionSublabel: {
    fontSize: 12,
    color: "#A1A1AA",
    marginTop: 2,
  },
  cancelButton: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E4E4E7",
  },
});

export default CustomBottomSheet;
