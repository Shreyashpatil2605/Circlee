import React, { useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  BackHandler,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { introSession } from "@/utils/introSession";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { requireOptionalNativeModule } from "expo-modules-core";

import CinematicAnimatedIntro from "@/components/intro/CinematicAnimatedIntro";

// Check if the native ExpoVideo module is compiled into the running application binary
const isNativeExpoVideoAvailable = !!requireOptionalNativeModule("ExpoVideo");

let ExpoVideoIntroComponent: React.ComponentType<{
  onFinish: () => void;
  onError?: (error: any) => void;
}> | null = null;

if (isNativeExpoVideoAvailable) {
  try {
    // Only load expo-video if the native C++/Kotlin module exists in the binary
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ExpoVideoIntroComponent = require("@/components/intro/ExpoVideoIntro").default;
  } catch {
    ExpoVideoIntroComponent = null;
  }
}

export default function IntroScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const insets = useSafeAreaInsets();
  const hasNavigatedRef = useRef(false);

  // Transition to authentication welcome screen or main tabs
  const navigateNext = useCallback(() => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;

    // Mark intro as played for this session
    introSession.markPlayed();

    // Navigate to tabs if already signed in, or auth welcome screen
    if (isSignedIn) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)");
    }
  }, [isSignedIn, router]);

  // Android hardware back button handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      navigateNext();
      return true;
    });

    return () => {
      backHandler.remove();
    };
  }, [navigateNext]);

  const handleSkip = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignored if haptics unavailable
    }
    navigateNext();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />

      {/* Video View (when native module is compiled into binary) OR Cinematic Animated Sequence */}
      {ExpoVideoIntroComponent ? (
        <ExpoVideoIntroComponent
          onFinish={navigateNext}
          onError={navigateNext}
        />
      ) : (
        <CinematicAnimatedIntro onFinish={navigateNext} />
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
          accessibilityLabel="Skip intro"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.skipText}>Skip</Text>
          <Feather name="chevron-right" size={14} color="#A855F7" style={styles.skipIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
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
