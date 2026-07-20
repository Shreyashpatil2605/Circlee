import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { VoicePlayer } from "./VoicePlayer";
import { MessageStatus } from "./MessageStatus";

interface VoiceBubbleProps {
  message: {
    _id: string;
    content: string;
    createdAt: number;
    senderId: string;
    readBy?: string[];
    type?: string;
    audioUrl?: string;
    attachments?: {
      type: string;
      url: string;
      metadata?: {
        duration?: number;
        waveform?: number[];
      };
    }[];
  };
  isOwnMessage: boolean;
  getBubbleRadiusStyle: () => any;
  formattedTime: string;
  readCount: number;
}

const VoiceBubbleComponent: React.FC<VoiceBubbleProps> = ({
  message,
  isOwnMessage,
  getBubbleRadiusStyle,
  formattedTime,
  readCount,
}) => {
  // Extract voice attachment properties
  const voiceAttachment = message.attachments?.find((a) => a.type === "voice");
  const audioUrl = voiceAttachment?.url || message.audioUrl || "";
  const waveform = voiceAttachment?.metadata?.waveform || Array(35).fill(4);
  const duration = voiceAttachment?.metadata?.duration || 0;

  if (isOwnMessage) {
    return (
      <LinearGradient
        colors={["#6B4EFF", "#8D6CFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          getBubbleRadiusStyle(),
          {
            paddingHorizontal: 12,
            paddingVertical: 10,
            width: 260,
            shadowColor: "#6B4EFF",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 2,
          },
        ]}
      >
        <VoicePlayer
          url={audioUrl}
          waveform={waveform}
          duration={duration}
          activeColor="bg-white"
          inactiveColor="bg-white/30"
          iconColor="#6B4EFF"
          buttonBg="bg-white"
          textColorClass="text-white/80"
        />
        <View className="flex-row items-center justify-end mt-1.5 self-end gap-1">
          <Text className="text-[10px] text-white/70">
            {formattedTime}
          </Text>
          <MessageStatus isOwnMessage={true} readByCount={readCount} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <View
      className="bg-chat-card border border-chat-divider"
      style={[
        getBubbleRadiusStyle(),
        {
          paddingHorizontal: 12,
          paddingVertical: 10,
          width: 260,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 1,
        },
      ]}
    >
      <VoicePlayer
        url={audioUrl}
        waveform={waveform}
        duration={duration}
        activeColor="bg-purple-600 dark:bg-purple-500"
        inactiveColor="bg-zinc-300 dark:bg-zinc-800"
        iconColor="#ffffff"
        buttonBg="bg-purple-600 dark:bg-purple-500"
        textColorClass="text-zinc-500 dark:text-zinc-400"
      />
      <View className="flex-row items-center justify-end mt-1.5 self-end">
        <Text className="text-[10px] text-zinc-500 dark:text-zinc-400">
          {formattedTime}
        </Text>
      </View>
    </View>
  );
};

export const VoiceBubble = React.memo(VoiceBubbleComponent);
VoiceBubble.displayName = "VoiceBubble";
