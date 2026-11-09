import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  BackHandler,
  Animated,
  Platform,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { introSession } from "@/utils/introSession";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const introVideoSource = require("@/assets/videos/intro.mp4");

export default function IntroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hasNavigatedRef = useRef(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [hasError, setHasError] = useState(false);

  // Transition to authentication welcome screen
  const navigateToAuth = useCallback(() => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;

    // Mark intro as played for this session
    introSession.markPlayed();

    // Smooth fade out before replacing route
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      router.replace("/(auth)");
    });
  }, [fadeAnim, router]);

  // Video player configuration using expo-video
  const player = useVideoPlayer(introVideoSource, (p) => {
    p.loop = false;
    p.muted = true;
    p.play();
  });

  // Listen to video completion and status events
  useEffect(() => {
    // 1. Playback completed handler
    const playToEndSubscription = player.addListener("playToEnd", () => {
      navigateToAuth();
    });

    // 2. Error and status change handler
    const statusSubscription = player.addListener("statusChange", (payload) => {
      if (payload.status === "error") {
        console.warn("Video playback encountered an issue, transitioning to Welcome screen:", payload.error);
        setHasError(true);
        navigateToAuth();
      }
    });

    // 3. Safety fallback timer (5 seconds) to ensure flow is never blocked
    const safetyTimeout = setTimeout(() => {
      if (!hasNavigatedRef.current) {
        console.log("Intro duration reached, transitioning...");
        navigateToAuth();
      }
    }, 4800);

    // 4. Android back button handler (acts as skip)
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      navigateToAuth();
      return true;
    });

    return () => {
      clearTimeout(safetyTimeout);
      playToEndSubscription.remove();
      statusSubscription.remove();
      backHandler.remove();
      try {
        player.pause();
      } catch {
        // Safe release on unmount
      }
    };
  }, [player, navigateToAuth]);

  const handleSkip = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignored if haptics unavailable
    }
    navigateToAuth();
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />

      {/* Main Full-Screen Video Layer */}
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
      />

      {/* Fallback View if error occurs */}
      {hasError && (
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>Circlee</Text>
        </View>
      )}

      {/* Premium Glassmorphism Skip Button */}
      <View
        style={[
          styles.skipContainer,
          {
            top: Math.max(insets.top, Platform.OS === "android" ? 16 : 44) + 8,
            right: 16,
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleSkip}
          activeOpacity={0.75}
          style={styles.skipButton}
          accessibilityRole="button"
          accessibilityLabel="Skip intro video"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.skipText}>Skip</Text>
          <Feather name="chevron-right" size={14} color="#A855F7" style={styles.skipIcon} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
  fallbackContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 2,
  },
  skipContainer: {
    position: "absolute",
    zIndex: 20,
    elevation: 5,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20, 20, 28, 0.75)",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  skipText: {
    color: "#F5F5F7",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  skipIcon: {
    marginLeft: 3,
    marginTop: 1,
  },
});
