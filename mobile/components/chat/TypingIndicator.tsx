import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";

export const TypingIndicator: React.FC = () => {
  // Shared values for the 3 bouncing dots
  const dot1Y = useSharedValue(0);
  const dot2Y = useSharedValue(0);
  const dot3Y = useSharedValue(0);

  useEffect(() => {
    // Staggered bouncing animations using Reanimated
    dot1Y.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 400 }),
        withTiming(0, { duration: 400 })
      ),
      -1,
      false
    );

    // Stagger dot 2 by starting it with sequence offset
    setTimeout(() => {
      dot2Y.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 400 }),
          withTiming(0, { duration: 400 })
        ),
        -1,
        false
      );
    }, 150);

    // Stagger dot 3 by starting it with sequence offset
    setTimeout(() => {
      dot3Y.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 400 }),
          withTiming(0, { duration: 400 })
        ),
        -1,
        false
      );
    }, 300);

    return () => {
      dot1Y.value = 0;
      dot2Y.value = 0;
      dot3Y.value = 0;
    };
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1Y.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2Y.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3Y.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className="px-4 mb-2 flex-row justify-start"
    >
      <View
        className="bg-chat-card border border-chat-divider flex-row items-center gap-1.5 px-4 py-3"
        style={{
          borderRadius: 24,
          borderBottomLeftRadius: 8,
          height: 40,
          width: 64,
          justifyContent: "center",
        }}
      >
        <Animated.View style={[styles.dot, dot1Style]} />
        <Animated.View style={[styles.dot, dot2Style]} />
        <Animated.View style={[styles.dot, dot3Style]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#8D6CFF",
  },
});

export default TypingIndicator;
