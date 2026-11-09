import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewProps,
  Animated,
  Text,
} from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
 * TabBarButton - Custom sub-component with smooth spring animation for active tab
 */
const TabBarButton: React.FC<{
  item: TabBarItem;
  isActive: boolean;
  onPress: () => void;
  tintColor: string;
  inactiveTintColor: string;
}> = ({ item, isActive, onPress, tintColor, inactiveTintColor }) => {
  const scaleValue = React.useRef(
    new Animated.Value(isActive ? 1 : 0.9),
  ).current;
  const opacityValue = React.useRef(
    new Animated.Value(isActive ? 1 : 0),
  ).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: isActive ? 1 : 0.9,
        useNativeDriver: true,
        friction: 7,
        tension: 80,
      }),
      Animated.timing(opacityValue, {
        toValue: isActive ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive, scaleValue, opacityValue]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.tabItemContainer}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={item.label}
    >
      <View style={styles.iconBubble}>
        {/* Violet active pill backdrop */}
        <Animated.View
          style={[
            styles.activePillBackground,
            {
              opacity: opacityValue,
              transform: [{ scale: scaleValue }],
            },
          ]}
        />

        {/* Tab Icon */}
        <Animated.View
          style={{
            transform: [{ scale: scaleValue }],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather
            name={item.icon as any}
            size={20}
            color={isActive ? tintColor : inactiveTintColor}
          />
        </Animated.View>

        {/* Violet Active Indicator Bar */}
        {isActive && (
          <View
            style={[
              styles.activeIndicator,
              { backgroundColor: tintColor },
            ]}
          />
        )}

        {/* Unread Badge (only when supported by real application data) */}
        {item.badge !== undefined && item.badge > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>
              {item.badge > 9 ? "9+" : item.badge}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

/**
 * FloatingBottomNavigation / GlassBottomTabBar - Circlee Hybrid Premium floating navigation
 */
export const GlassBottomTabBar: React.FC<GlassBottomTabBarProps> = ({
  items,
  activeIndex,
  onTabPress,
  tintColor = "#8B5CF6", // Circlee Violet Primary Accent
  inactiveTintColor = "#A1A1AA", // Muted Gray Inactive
  blurIntensity = 75,
  style,
  ...props
}) => {
  const insets = useSafeAreaInsets();
  // Safe offset above Android navigation bar / gesture insets or fallback 12px
  const bottomOffset = insets.bottom > 0 ? insets.bottom + 6 : 12;

  return (
    <View
      style={[
        styles.outerContainer,
        { bottom: bottomOffset },
        style,
      ]}
      {...props}
    >
      <View style={styles.floatingPill}>
        {Platform.OS === "ios" ? (
          <BlurView intensity={blurIntensity} tint="dark" style={styles.innerBlur}>
            <View style={styles.tabsWrapper}>
              {items.map((item, index) => (
                <TabBarButton
                  key={item.name}
                  item={item}
                  isActive={index === activeIndex}
                  onPress={() => onTabPress(index)}
                  tintColor={tintColor}
                  inactiveTintColor={inactiveTintColor}
                />
              ))}
            </View>
          </BlurView>
        ) : (
          <View style={styles.androidBackground}>
            <View style={styles.tabsWrapper}>
              {items.map((item, index) => (
                <TabBarButton
                  key={item.name}
                  item={item}
                  isActive={index === activeIndex}
                  onPress={() => onTabPress(index)}
                  tintColor={tintColor}
                  inactiveTintColor={inactiveTintColor}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export const FloatingBottomNavigation = GlassBottomTabBar;

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    height: 56, // Refined height (~12.5% reduction from 64px for sleeker profile while preserving touch target)
    zIndex: 99,
  },
  floatingPill: {
    flex: 1,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#272733",
    backgroundColor: "rgba(20, 20, 28, 0.94)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 14,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  innerBlur: {
    flex: 1,
    backgroundColor: "rgba(20, 20, 28, 0.75)",
  },
  androidBackground: {
    flex: 1,
    backgroundColor: "rgba(20, 20, 28, 0.96)",
  },
  tabsWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 6,
  },
  tabItemContainer: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activePillBackground: {
    position: "absolute",
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: 13,
    backgroundColor: "rgba(139, 92, 246, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 2,
    width: 12,
    height: 2.5,
    borderRadius: 1.5,
  },
  badgeContainer: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: "#8B5CF6",
    borderWidth: 1.5,
    borderColor: "#14141C",
    paddingHorizontal: 2.5,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  badgeText: {
    fontSize: 8.5,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 11,
  },
});

export default GlassBottomTabBar;
