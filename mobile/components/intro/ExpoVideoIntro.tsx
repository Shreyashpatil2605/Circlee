import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

const introVideoSource = require("@/assets/videos/intro.mp4");

interface ExpoVideoIntroProps {
  onFinish: () => void;
  onError?: (error: any) => void;
}

export default function ExpoVideoIntro({ onFinish, onError }: ExpoVideoIntroProps) {
  const hasFinishedRef = useRef(false);

  const handleFinish = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    onFinish();
  };

  const player = useVideoPlayer(introVideoSource, (p) => {
    p.loop = false;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    const playToEndSubscription = player.addListener("playToEnd", () => {
      handleFinish();
    });

    const statusSubscription = player.addListener("statusChange", (payload) => {
      if (payload.status === "readyToPlay") {
        try {
          player.play();
        } catch {
          // ignore
        }
      } else if (payload.status === "error") {
        console.warn("ExpoVideo error:", payload.error);
        onError?.(payload.error);
        handleFinish();
      }
    });

    // Ensure playback starts immediately
    try {
      player.play();
    } catch {
      // ignore
    }

    // Safety timeout (4.8 seconds)
    const timeout = setTimeout(() => {
      handleFinish();
    }, 4800);

    return () => {
      clearTimeout(timeout);
      playToEndSubscription.remove();
      statusSubscription.remove();
      try {
        player.pause();
      } catch {
        // Safe release
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
});
