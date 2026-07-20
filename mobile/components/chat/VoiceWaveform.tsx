import React, { useMemo } from "react";
import { View, Pressable, GestureResponderEvent } from "react-native";

interface VoiceWaveformProps {
  waveform: number[];
  progress?: number; // 0 to 1
  onSeek?: (progress: number) => void;
  activeColor?: string;
  inactiveColor?: string;
  barWidth?: number;
  gap?: number;
}

const VoiceWaveformComponent: React.FC<VoiceWaveformProps> = ({
  waveform,
  progress = 0,
  onSeek,
  activeColor = "bg-purple-500",
  inactiveColor = "bg-gray-300 dark:bg-zinc-700",
  barWidth = 3,
  gap = 2,
}) => {
  const barCount = 35;

  const sampled = useMemo(() => {
    if (!waveform || waveform.length === 0) {
      return Array(barCount).fill(4);
    }
    if (waveform.length <= barCount) {
      const res = [...waveform];
      while (res.length < barCount) {
        res.push(4);
      }
      return res;
    }
    const step = waveform.length / barCount;
    const res: number[] = [];
    for (let i = 0; i < barCount; i++) {
      const start = Math.floor(i * step);
      const end = Math.floor((i + 1) * step);
      const chunk = waveform.slice(start, end);
      const avg = chunk.reduce((s, v) => s + v, 0) / (chunk.length || 1);
      res.push(Math.max(4, Math.round(avg)));
    }
    return res;
  }, [waveform]);

  const handlePress = (event: GestureResponderEvent) => {
    if (!onSeek) return;
    const { locationX } = event.nativeEvent;
    const totalWidth = barCount * (barWidth + gap) - gap;
    const pct = Math.max(0, Math.min(1, locationX / totalWidth));
    onSeek(pct);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center h-10 px-1 justify-center"
      style={{ pointerEvents: onSeek ? "auto" : "none" }}
    >
      {sampled.map((height, index) => {
        const isActive = index / barCount <= progress;
        return (
          <View
            key={index}
            style={{
              width: barWidth,
              height: height,
              marginRight: index < barCount - 1 ? gap : 0,
              borderRadius: barWidth / 2,
            }}
            className={isActive ? activeColor : inactiveColor}
          />
        );
      })}
    </Pressable>
  );
};

export const VoiceWaveform = React.memo(VoiceWaveformComponent);
VoiceWaveform.displayName = "VoiceWaveform";
