import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";

export const NotificationSkeleton = () => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View className="mb-3 mx-4 rounded-2xl overflow-hidden border border-white/5">
      <BlurView intensity={20} tint="dark" className="flex-row p-4 items-start">
        {/* Left side: Avatar & Badge */}
        <View className="relative mr-3">
          <Animated.View
            style={animatedStyle}
            className="w-12 h-12 rounded-full bg-white/20"
          />
          <Animated.View
            style={animatedStyle}
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white/30 border border-[#0F0F1A]"
          />
        </View>

        {/* Right side: Content */}
        <View className="flex-1 gap-2">
          {/* Header Row: Name & Time */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row gap-2">
              <Animated.View
                style={animatedStyle}
                className="w-24 h-4 rounded-full bg-white/20"
              />
              <Animated.View
                style={animatedStyle}
                className="w-16 h-4 rounded-full bg-white/10"
              />
            </View>
            <Animated.View
              style={animatedStyle}
              className="w-8 h-3 rounded-full bg-white/10"
            />
          </View>

          {/* Description line */}
          <Animated.View
            style={animatedStyle}
            className="w-3/4 h-3.5 rounded-full bg-white/10 mt-1"
          />

          {/* Preview Box skeleton */}
          <Animated.View
            style={animatedStyle}
            className="w-full h-16 rounded-xl bg-white/5 border border-white/5 mt-2"
          />
        </View>
      </BlurView>
    </View>
  );
};

export const NotificationSkeletonList = () => {
  return (
    <View className="flex-1 mt-2">
      <NotificationSkeleton />
      <NotificationSkeleton />
      <NotificationSkeleton />
      <NotificationSkeleton />
      <NotificationSkeleton />
    </View>
  );
};
