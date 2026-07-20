import React, { useEffect } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export const AnimatedBackground: React.FC = () => {
  // Shared values for moving the glowing blob
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Continuous smooth movement animations
    translateX.value = withRepeat(
      withSequence(
        withTiming(width * 0.25, { duration: 10000 }),
        withTiming(-width * 0.25, { duration: 12000 }),
        withTiming(0, { duration: 8000 })
      ),
      -1,
      true
    );

    translateY.value = withRepeat(
      withSequence(
        withTiming(height * 0.15, { duration: 9000 }),
        withTiming(-height * 0.15, { duration: 11000 }),
        withTiming(0, { duration: 9000 })
      ),
      -1,
      true
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 7000 }),
        withTiming(0.9, { duration: 9000 }),
        withTiming(1.0, { duration: 6000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedBlobStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <View style={StyleSheet.absoluteFillObject} className="bg-chat-bg">
      {/* Subtle Purple Glow Blob */}
      <Animated.View
        style={[
          styles.blob,
          animatedBlobStyle,
          {
            backgroundColor: "#6B4EFF",
            opacity: 0.03, // 3% opacity as requested
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    top: height * 0.25,
    left: width * 0.1,
    // Add heavy blur using software styling if blur is not supported,
    // and let the shape be soft
  },
});

export default AnimatedBackground;
