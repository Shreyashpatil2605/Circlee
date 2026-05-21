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
 * TabBarButton - Custom sub-component that handles micro-animations for each tab
 */
const TabBarButton: React.FC<{
  item: TabBarItem;
  isActive: boolean;
  onPress: () => void;
  tintColor: string;
  inactiveTintColor: string;
}> = ({ item, isActive, onPress, tintColor, inactiveTintColor }) => {
  const scaleValue = React.useRef(new Animated.Value(isActive ? 1 : 0.85)).current;
  const opacityValue = React.useRef(new Animated.Value(isActive ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: isActive ? 1 : 0.88,
        useNativeDriver: true,
        friction: 6,
        tension: 80,
      }),
      Animated.timing(opacityValue, {
        toValue: isActive ? 1 : 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.tabItemContainer}
      activeOpacity={0.7}
    >
      <View style={styles.iconBubble}>
        {/* Subtle monochromatic pill background - animated */}
        <Animated.View
          style={[
            styles.activePillBackground,
            {
              opacity: opacityValue,
              transform: [{ scale: scaleValue }],
            },
          ]}
        />

        {/* Icon - animated scale */}
        <Animated.View style={{ transform: [{ scale: scaleValue }], alignItems: "center", justifyContent: "center" }}>
          <Feather
            name={item.icon as any}
            size={22}
            color={isActive ? tintColor : inactiveTintColor}
            style={styles.icon}
          />
        </Animated.View>
      </View>

      {/* Notification Dot */}
      {item.badge !== undefined && item.badge > 0 && (
        <View style={styles.notificationDot} />
      )}
    </TouchableOpacity>
  );
};

/**
 * GlassBottomTabBar - Premium Apple-like minimalist glassmorphic bottom navigation
 */
export const GlassBottomTabBar: React.FC<GlassBottomTabBarProps> = ({
  items,
  activeIndex,
  onTabPress,
  tintColor = "#0F172A", // Charcoal/slate black for clean premium look
  inactiveTintColor = "#94A3B8", // Soft slate gray
  blurIntensity = 75, // Sleek, semi-transparent blur
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      {/* Frosted Glass Blur Effect */}
      <BlurView intensity={blurIntensity} style={styles.blurContainer}>
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.55)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        >
          {/* Tab Items Container */}
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
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.06)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  gradient: {
    flex: 1,
    borderRadius: 24,
    justifyContent: "flex-start",
    overflow: "hidden",
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
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activePillBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    backgroundColor: "rgba(15, 23, 42, 0.06)", // Soft charcoal pill
  },
  icon: {
    marginBottom: 0,
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444", // Clean iOS system red
    borderWidth: 1.5,
    borderColor: "#FFF",
    zIndex: 4,
  },
});

