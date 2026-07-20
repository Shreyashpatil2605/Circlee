import React from "react";
import { Text } from "react-native";

interface RecordingTimerProps {
  durationSeconds: number;
  className?: string;
}

const RecordingTimerComponent: React.FC<RecordingTimerProps> = ({ durationSeconds, className }) => {
  const mins = Math.floor(durationSeconds / 60);
  const secs = Math.floor(durationSeconds % 60);
  const formatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  return <Text className={className}>{formatted}</Text>;
};

export const RecordingTimer = React.memo(RecordingTimerComponent);
RecordingTimer.displayName = "RecordingTimer";
