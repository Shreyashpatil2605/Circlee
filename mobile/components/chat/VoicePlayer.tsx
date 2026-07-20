import React from "react";
import { View, Text } from "react-native";
import { useVoicePlayer } from "../../hooks/useVoicePlayer";
import { PlaybackControls } from "./PlaybackControls";
import { VoiceWaveform } from "./VoiceWaveform";
import { RecordingTimer } from "./RecordingTimer";

interface VoicePlayerProps {
  url: string;
  waveform: number[];
  duration: number;
  activeColor?: string;
  inactiveColor?: string;
  iconColor?: string;
  buttonBg?: string;
  textColorClass?: string;
}

const VoicePlayerComponent: React.FC<VoicePlayerProps> = ({
  url,
  waveform,
  duration: initialDuration,
  activeColor,
  inactiveColor,
  iconColor,
  buttonBg,
  textColorClass = "text-zinc-500 dark:text-zinc-400",
}) => {
  const {
    isPlaying,
    currentTime,
    duration,
    progress,
    speed,
    isDownloading,
    togglePlay,
    cycleSpeed,
    player,
  } = useVoicePlayer(url);

  const displayDuration = currentTime > 0 ? currentTime : (duration || initialDuration);

  const handleSeek = (pct: number) => {
    const activeDuration = duration || initialDuration;
    if (player && activeDuration > 0) {
      player.seekTo(pct * activeDuration * 1000);
    }
  };

  return (
    <View className="flex-row items-center gap-3">
      <PlaybackControls
        isPlaying={isPlaying}
        onToggle={togglePlay}
        speed={speed}
        onSpeedCycle={cycleSpeed}
        isDownloading={isDownloading}
        iconColor={iconColor}
        buttonBg={buttonBg}
      />
      <View className="flex-1 justify-center">
        <VoiceWaveform
          waveform={waveform}
          progress={progress}
          onSeek={handleSeek}
          activeColor={activeColor}
          inactiveColor={inactiveColor}
        />
        <View className="flex-row justify-between items-center px-1">
          <RecordingTimer
            durationSeconds={displayDuration}
            className={`text-[10px] ${textColorClass}`}
          />
          {isDownloading && (
            <Text className="text-[8px] text-zinc-400 italic">Caching...</Text>
          )}
        </View>
      </View>
    </View>
  );
};

export const VoicePlayer = React.memo(VoicePlayerComponent);
VoicePlayer.displayName = "VoicePlayer";
