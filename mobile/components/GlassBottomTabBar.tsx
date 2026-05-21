import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewProps,
  Animated,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

export interface TabBarItem {
  name: string;
  icon: string;
  label: string;
  badge?: number;
}

interface GlassBottomTabBarProps extends ViewProps {
  items: TabBarItem[];
  activeIndex: number;
  onTabPress: (index: number) => void;
  tintColor?: string;
  inactiveTintColor?: string;
  blurIntensity?: number;
}

/**
 * GlassBottomTabBar - Premium glassmorphic bottom navigation
 *
 * Features:
 * - Frosted glass blur effect (98% opacity)
 * - Translucent white gradient overlay
 * - Floating pill-shaped design
 * - Soft platform shadows
 * - Rounded corners (24px)
 * - Subtle white highlight border
 * - Glowing active tab indicator
 * - Smooth animations
 * - iOS/Android optimized
 */
export const GlassBottomTabBar: React.FC<GlassBottomTabBarProps> = ({
  items,
  activeIndex,
  onTabPress,
  tintColor = "#FF3B30",
  inactiveTintColor = "rgba(255, 255, 255, 0.6)",
  blurIntensity = 98,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      {/* Frosted Glass Blur Effect */}
      <BlurView intensity={blurIntensity} style={styles.blurContainer}>
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.18)", "rgba(255, 255, 255, 0.12)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        >
          {/* Subtle White Highlight Border (Top) */}
          <View style={styles.highlightBorder} />

          {/* Tab Items Container */}
          <View style={styles.tabsWrapper}>
            {items.map((item, index) => {
              const isActive = index === activeIndex;

              return (
                <TouchableOpacity
                  key={item.name}
                  onPress={() => onTabPress(index)}
                  style={styles.tabItemContainer}
                  activeOpacity={0.7}
                >
                  {/* Active Tab Background Glow */}
                  {isActive && (
                    <>
                      {/* Glow Layer */}
                      <View
                        style={[
                          styles.activeGlowLayer,
                          {
                            backgroundColor: tintColor,
                          },
                        ]}
                      />
                      {/* Background Layer */}
                      <View
                        style={[
                          styles.activeBackgroundLayer,
                          {
                            borderColor: "rgba(255, 255, 255, 0.4)",
                          },
                        ]}
                      />
                    </>
                  )}

                  {/* Icon */}
                  <Feather
                    name={item.icon as any}
                    size={24}
                    color={isActive ? tintColor : inactiveTintColor}
                    style={styles.icon}
                  />

                  {/* Badge Indicator */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: tintColor,
                        },
                      ]}
                    >
                      {item.badge <= 99 && <></>}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 88,
    justifyContent: "flex-end",
    paddingBottom: Platform.OS === "ios" ? 20 : 12,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  blurContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.35)",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
      android: {
        elevation: 24,
      },
    }),
  },
  gradient: {
    flex: 1,
    borderRadius: 24,
    justifyContent: "flex-start",
    overflow: "hidden",
  },
  highlightBorder: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tabsWrapper: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  tabItemContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    borderRadius: 16,
    position: "relative",
  },
  activeGlowLayer: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    opacity: 0.15,
    zIndex: 0,
  },
  activeBackgroundLayer: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    zIndex: 1,
  },
  icon: {
    zIndex: 2,
    marginBottom: 2,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF3B30",
    zIndex: 3,
    borderWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
});
