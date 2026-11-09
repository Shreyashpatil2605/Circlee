import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const officialSymbol = require("@/assets/images/circlee-symbol-square.png");

interface CinematicAnimatedIntroProps {
  onFinish: () => void;
}

export default function CinematicAnimatedIntro({ onFinish }: CinematicAnimatedIntroProps) {
  // Individual circle animations
  const topOpacity = useRef(new Animated.Value(0)).current;
  const topTranslateY = useRef(new Animated.Value(-120)).current;
  const topScale = useRef(new Animated.Value(0.7)).current;

  const blOpacity = useRef(new Animated.Value(0)).current;
  const blTranslateX = useRef(new Animated.Value(-120)).current;
  const blTranslateY = useRef(new Animated.Value(90)).current;
  const blScale = useRef(new Animated.Value(0.7)).current;

  const brOpacity = useRef(new Animated.Value(0)).current;
  const brTranslateX = useRef(new Animated.Value(120)).current;
  const brTranslateY = useRef(new Animated.Value(90)).current;
  const brScale = useRef(new Animated.Value(0.7)).current;

  // Convergence and emblem cross-fade
  const emblemOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.6)).current;

  // Tagline and global fade
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const globalFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Staggered individual appearances (0.0s - 1.2s)
    const appearSequence = Animated.stagger(180, [
      Animated.parallel([
        Animated.timing(topOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(topScale, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(blOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(blScale, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(brOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(brScale, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]);

    // 2. Converge towards center (1.2s - 2.0s)
    const convergeAnim = Animated.parallel([
      Animated.timing(topTranslateY, {
        toValue: -42,
        duration: 750,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
        useNativeDriver: true,
      }),
      Animated.timing(blTranslateX, {
        toValue: -42,
        duration: 750,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
        useNativeDriver: true,
      }),
      Animated.timing(blTranslateY, {
        toValue: 30,
        duration: 750,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
        useNativeDriver: true,
      }),
      Animated.timing(brTranslateX, {
        toValue: 42,
        duration: 750,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
        useNativeDriver: true,
      }),
      Animated.timing(brTranslateY, {
        toValue: 30,
        duration: 750,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
        useNativeDriver: true,
      }),
    ]);

    // 3. Neon intersection glow bloom & emblem reveal (2.0s - 2.6s)
    const neonGlowAnim = Animated.parallel([
      Animated.timing(glowOpacity, {
        toValue: 0.85,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(glowScale, {
        toValue: 1.3,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(emblemOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    // 4. Tagline fade in (2.5s - 3.2s)
    const taglineAnim = Animated.timing(taglineOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    });

    // 5. Final cinematic fade out (3.4s - 4.0s)
    const fadeOutAnim = Animated.sequence([
      Animated.delay(700),
      Animated.timing(globalFade, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]);

    const masterSequence = Animated.sequence([
      appearSequence,
      convergeAnim,
      neonGlowAnim,
      taglineAnim,
      fadeOutAnim,
    ]);

    masterSequence.start(({ finished }) => {
      if (finished) {
        onFinish();
      }
    });

    return () => {
      masterSequence.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onFinish]);

  const circleDiameter = Math.min(SCREEN_WIDTH * 0.36, 140);
  const circleRadius = circleDiameter / 2;

  return (
    <Animated.View style={[styles.container, { opacity: globalFade }]}>
      {/* Center Stage for Emblem Animation */}
      <View style={styles.stage}>
        {/* Neon Glow Core */}
        <Animated.View
          style={[
            styles.neonGlow,
            {
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />

        {/* 1. Top Gradient Circle */}
        <Animated.View
          style={[
            styles.circleWrapper,
            {
              width: circleDiameter,
              height: circleDiameter,
              borderRadius: circleRadius,
              opacity: topOpacity,
              transform: [
                { translateY: topTranslateY },
                { scale: topScale },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={["#2563EB", "#D946EF"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>

        {/* 2. Bottom-Left Gradient Circle */}
        <Animated.View
          style={[
            styles.circleWrapper,
            {
              width: circleDiameter,
              height: circleDiameter,
              borderRadius: circleRadius,
              opacity: blOpacity,
              transform: [
                { translateX: blTranslateX },
                { translateY: blTranslateY },
                { scale: blScale },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={["#3B82F6", "#C026D3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>

        {/* 3. Bottom-Right Gradient Circle */}
        <Animated.View
          style={[
            styles.circleWrapper,
            {
              width: circleDiameter,
              height: circleDiameter,
              borderRadius: circleRadius,
              opacity: brOpacity,
              transform: [
                { translateX: brTranslateX },
                { translateY: brTranslateY },
                { scale: brScale },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={["#E11D48", "#F97316"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>

        {/* 4. Complete Official Circlee Emblem (Cross-fades in) */}
        <Animated.View
          style={[
            styles.emblemContainer,
            {
              opacity: emblemOpacity,
            },
          ]}
        >
          <Image
            source={officialSymbol}
            style={styles.emblemImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* 5. Tagline Display */}
      <Animated.View
        style={[
          styles.taglineContainer,
          {
            opacity: taglineOpacity,
          },
        ]}
      >
        <Text style={styles.taglineText}>YOUR SPACE. YOUR PEOPLE. YOUR CIRCLE.</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  stage: {
    width: 260,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  circleWrapper: {
    position: "absolute",
    overflow: "hidden",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 4,
  },
  emblemContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  emblemImage: {
    width: 220,
    height: 220,
  },
  neonGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(168, 85, 247, 0.4)",
    shadowColor: "#D946EF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 30,
    elevation: 10,
  },
  taglineContainer: {
    marginTop: 48,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  taglineText: {
    color: "#F5F5F7",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2.2,
    textAlign: "center",
    textShadowColor: "rgba(139, 92, 246, 0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
