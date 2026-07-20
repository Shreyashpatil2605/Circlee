import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { RecordingTimer } from "./RecordingTimer";
import { VoiceWaveform } from "./VoiceWaveform";
import { Feather } from "@expo/vector-icons";

interface RecordingOverlayProps {
  durationSeconds: number;
  waveform: number[];
  isLocked: boolean;
  onCancel: () => void;
  onStopAndSave: () => void;
}

export const RecordingOverlay: React.FC<RecordingOverlayProps> = ({
  durationSeconds,
  waveform,
  isLocked,
  onCancel,
  onStopAndSave,
}) => {
  const dotOpacity = useSharedValue(1);

  useEffect(() => {
    dotOpacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  }, [dotOpacity]);

  const animatedDotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  return (
    <BlurView
      intensity={50}
      tint="dark"
      className="absolute inset-0 flex-row items-center justify-between px-4 py-2 rounded-full overflow-hidden bg-black/40 border border-white/10"
    >
      <View className="flex-row items-center gap-2">
        <Animated.View
          style={animatedDotStyle}
          className="w-2.5 h-2.5 rounded-full bg-red-500"
        />
        <RecordingTimer
          durationSeconds={durationSeconds}
          className="text-sm font-semibold text-white"
        />
      </View>

      <View className="flex-1 px-4 justify-center">
        <VoiceWaveform
          waveform={waveform}
          activeColor="bg-red-500"
          inactiveColor="bg-white/20"
        />
      </View>

      {isLocked ? (
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={onCancel}
            className="w-8 h-8 rounded-full bg-red-500/20 items-center justify-center active:bg-red-500/30"
          >
            <Feather name="trash-2" size={16} color="#ef4444" />
          </Pressable>
          <Pressable
            onPress={onStopAndSave}
            className="px-3 py-1.5 rounded-full bg-purple-600 items-center justify-center active:bg-purple-700"
          >
            <Text className="text-xs font-bold text-white">Stop</Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex-row items-center gap-1">
          <Feather name="lock" size={12} color="#ffffff" style={{ opacity: 0.6 }} />
          <Text className="text-[10px] text-white/60">
            Swipe up to lock
          </Text>
        </View>
      )}
    </BlurView>
  );
};
