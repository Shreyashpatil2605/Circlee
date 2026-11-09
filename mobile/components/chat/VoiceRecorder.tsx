import React from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { modalService } from "@/context/ModalContext";

interface VoiceRecorderProps {
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
  onLock: () => void;
  onPressIn?: () => void;
  isRecording: boolean;
  isLocked: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onStart,
  onStop,
  onCancel,
  onLock,
  onPressIn,
  isRecording,
  isLocked,
}) => {
  const scale = useSharedValue(1);
  const cancelled = useSharedValue(false);
  const recordingStarted = useSharedValue(false);

  const showHoldHint = () => {
    modalService.showToast(
      "Press and hold the mic to record. Swipe up to lock, or swipe left to cancel.",
      "info",
      "Hold to record"
    );
  };

  const longPressGesture = Gesture.LongPress()
    .minDuration(400)
    .maxDistance(9999)
    .onBegin(() => {
      console.log("[GESTURE] Touch down (LongPress begin)");
      scale.value = withSpring(1.1);
      if (onPressIn) {
        runOnJS(onPressIn)();
      }
    })
    .onStart(() => {
      console.log("[GESTURE] LongPress activated (threshold met)");
      cancelled.value = false;
      recordingStarted.value = true;
      scale.value = withSpring(1.25);
      runOnJS(onStart)();
    })
    .onFinalize((event, success) => {
      console.log("[GESTURE] LongPress finalized, success:", success);
      scale.value = withSpring(1);
      
      if (success) {
        // Threshold was met, user released after holding
        if (!cancelled.value) {
          if (!isLocked) {
            console.log("[GESTURE] Recording complete, stopping");
            runOnJS(onStop)();
          } else {
            console.log("[GESTURE] Released but locked, doing nothing");
          }
        }
      } else {
        // User released before 400ms threshold
        if (recordingStarted.value) {
          if (!cancelled.value && !isLocked) {
            runOnJS(onStop)();
          }
        } else {
          console.log("[GESTURE] Short tap detected, showing hold hint");
          runOnJS(onCancel)();
          runOnJS(showHoldHint)();
        }
      }
      recordingStarted.value = false;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      console.log("[PAN] update translationX:", Math.round(event.translationX), "translationY:", Math.round(event.translationY), "started:", recordingStarted.value);
      if (!recordingStarted.value || cancelled.value) return;

      // Swipe left to cancel
      if (event.translationX < -45) {
        console.log("[GESTURE] Swipe Left detected");
        cancelled.value = true;
        scale.value = withSpring(1);
        runOnJS(onCancel)();
      }
      // Swipe up to lock
      else if (event.translationY < -30) {
        console.log("[GESTURE] Swipe Up detected");
        cancelled.value = true;
        scale.value = withSpring(1);
        runOnJS(onLock)();
      }
    });

  const combinedGesture = Gesture.Simultaneous(longPressGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View
        collapsable={false}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        style={animatedStyle}
        className={`w-10 h-10 rounded-full items-center justify-center ${
          isRecording ? "bg-red-500" : "bg-purple-600 dark:bg-purple-500"
        }`}
      >
        <Feather name="mic" size={20} color="#ffffff" />
      </Animated.View>
    </GestureDetector>
  );
};
