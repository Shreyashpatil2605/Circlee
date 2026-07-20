import React from "react";
import { View, Pressable, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onToggle: () => void;
  speed?: number;
  onSpeedCycle?: () => void;
  isDownloading?: boolean;
  iconColor?: string;
  buttonBg?: string;
}

const PlaybackControlsComponent: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onToggle,
  speed,
  onSpeedCycle,
  isDownloading = false,
  iconColor = "#ffffff",
  buttonBg = "bg-purple-600 dark:bg-purple-500",
}) => {
  return (
    <View className="flex-row items-center gap-2">
      <Pressable
        onPress={onToggle}
        disabled={isDownloading}
        className={`w-8 h-8 rounded-full ${buttonBg} items-center justify-center active:opacity-80`}
      >
        {isPlaying ? (
          <Feather name="pause" size={14} color={iconColor} />
        ) : (
          <Feather name="play" size={14} color={iconColor} style={{ marginLeft: 2 }} />
        )}
      </Pressable>

      {onSpeedCycle && speed !== undefined && (
        <Pressable
          onPress={onSpeedCycle}
          className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 active:opacity-80"
        >
          <Text className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
            {speed}x
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export const PlaybackControls = React.memo(PlaybackControlsComponent);
PlaybackControls.displayName = "PlaybackControls";
