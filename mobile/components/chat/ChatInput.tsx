import React, { useRef } from "react";
import { View, TextInput, TouchableOpacity, ActivityIndicator, Text, ScrollView } from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useApiClient } from "@/utils/api";
import { RecordingOverlay } from "./RecordingOverlay";
import { VoiceRecorder } from "./VoiceRecorder";
import { VoicePlayer } from "./VoicePlayer";

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAttachmentPress?: () => void;
  onVoicePress?: () => void;
  onEmojiPress?: () => void;
  onSendVoice?: (attachments: any[]) => Promise<void>;
  isSending?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  onAttachmentPress,
  onVoicePress,
  onEmojiPress,
  onSendVoice,
  isSending = false,
}) => {
  const hasText = value.trim().length > 0;
  const api = useApiClient();
  const textInputRef = useRef<TextInput>(null);

  const {
    isRecording,
    isLocked,
    setIsLocked,
    status,
    setStatus,
    waveform,
    setWaveform,
    durationSeconds,
    recordedUri,
    setRecordedUri,
    start,
    stopAndSave,
    cancel,
  } = useVoiceRecorder();

  const handleStartRecording = () => {
    start();
  };

  const handleStopRecording = () => {
    stopAndSave();
  };

  const handleCancelRecording = () => {
    cancel();
  };

  const handleLockRecording = () => {
    setIsLocked(true);
  };

  const uploadAndSend = async (uriToUpload: string, duration: number, waveformSamples: number[]) => {
    try {
      setStatus("uploading");
      
      const formData = new FormData();
      formData.append("file", {
        uri: uriToUpload,
        name: "voice_message.m4a",
        type: "audio/m4a",
      } as any);
      formData.append("duration", duration.toString());

      const response = await api.post("/uploads", formData);

      const data = response.data;
      
      const attachments = [
        {
          type: "voice",
          url: data.url,
          metadata: {
            duration: duration,
            waveform: waveformSamples,
            fileSize: data.duration ? 0 : 0, // Fallback if size not present
            mimeType: data.mimeType || "audio/x-m4a",
          },
        },
      ];

      if (onSendVoice) {
        await onSendVoice(attachments);
      }

      // Reset recording states
      setStatus("idle");
      setWaveform([]);
      setRecordedUri(null);
    } catch (error) {
      console.error("Upload voice message failed:", error);
      setStatus("failed");
    }
  };

  const handleSendVoice = () => {
    if (recordedUri) {
      uploadAndSend(recordedUri, durationSeconds, waveform);
    }
  };

  const handleRetryUpload = () => {
    if (recordedUri) {
      uploadAndSend(recordedUri, durationSeconds, waveform);
    }
  };

  const handleDiscardRecording = () => {
    cancel();
  };

  // Main Send Action (standard text message)
  const handleTextSend = () => {
    onSend();
  };

  return (
    <View className="absolute bottom-0 left-0 right-0 border-t border-chat-divider">
      <BlurView
        intensity={80}
        tint="dark"
        style={{ paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "rgba(11, 11, 18, 0.6)" }}
      >
        <ScrollView
          horizontal
          scrollEnabled={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ flexGrow: 1 }}
          showsHorizontalScrollIndicator={false}
        >
          <View className="flex-row items-center gap-2 relative flex-1">
            
            {/* 1. Normal Mode (Idle or Recording) */}
            {(status === "idle" || status === "recording") && (
              <>
                {/* Emoji Button */}
                <TouchableOpacity
                  onPress={onEmojiPress}
                  activeOpacity={0.7}
                  className="p-2 rounded-full bg-chat-secondary/40"
                >
                  <Feather name="smile" size={20} color="#A7A7B5" />
                </TouchableOpacity>

                {/* Attachment Plus Button */}
                <TouchableOpacity
                  onPress={onAttachmentPress}
                  activeOpacity={0.7}
                  className="p-2 rounded-full bg-chat-secondary/40"
                >
                  <Feather name="plus" size={20} color="#A7A7B5" />
                </TouchableOpacity>

                {/* Main Text Input Area */}
                <View className="flex-1 flex-row items-center bg-chat-secondary/50 border border-chat-divider rounded-2xl px-3 py-1.5 min-h-[40] max-h-[120]">
                  <TextInput
                    ref={textInputRef}
                    placeholder="Message..."
                    placeholderTextColor="#A7A7B5"
                    value={value}
                    onChangeText={onChangeText}
                    multiline
                    style={{ color: "#FFFFFF", fontSize: 15, flex: 1, padding: 0 }}
                  />

                  {/* Clip Button */}
                  <TouchableOpacity
                    onPress={onAttachmentPress}
                    activeOpacity={0.7}
                    className="p-1.5 ml-1"
                  >
                    <Feather name="paperclip" size={16} color="#A7A7B5" />
                  </TouchableOpacity>
                </View>

                {/* Action Button: Text Send */}
                {hasText && (
                  <TouchableOpacity
                    key="send-button"
                    onPress={handleTextSend}
                    disabled={isSending}
                    activeOpacity={0.8}
                    className="w-10 h-10 rounded-full bg-chat-purple items-center justify-center shadow-lg"
                    style={{
                      shadowColor: "#6B4EFF",
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 10,
                      elevation: 5,
                    }}
                  >
                    {isSending ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Feather name="arrow-up" size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* 2. Recording Mode (Overlay covering input fields) */}
            {status === "recording" && (
              <RecordingOverlay
                durationSeconds={durationSeconds}
                waveform={waveform}
                isLocked={isLocked}
                onCancel={handleCancelRecording}
                onStopAndSave={handleStopRecording}
              />
            )}

          {/* 3. Preview Mode */}
          {status === "preview" && recordedUri && (
            <View className="flex-1 flex-row items-center gap-3">
              {/* Discard / Delete Button */}
              <TouchableOpacity
                onPress={handleDiscardRecording}
                className="p-2.5 rounded-full bg-red-500/20 active:bg-red-500/35"
              >
                <Feather name="trash-2" size={18} color="#ef4444" />
              </TouchableOpacity>

              {/* Premium Preview Player */}
              <View className="flex-1 bg-chat-secondary/50 border border-chat-divider rounded-2xl p-2">
                <VoicePlayer
                  url={recordedUri}
                  waveform={waveform}
                  duration={durationSeconds}
                  activeColor="bg-purple-500"
                  inactiveColor="bg-white/20"
                  iconColor="#FFFFFF"
                  buttonBg="bg-purple-600"
                  textColorClass="text-zinc-400"
                />
              </View>

              {/* Send Button */}
              <TouchableOpacity
                onPress={handleSendVoice}
                className="w-10 h-10 rounded-full bg-purple-600 items-center justify-center shadow-lg active:bg-purple-700"
              >
                <Feather name="arrow-up" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* 4. Uploading Mode */}
          {status === "uploading" && (
            <View className="flex-1 flex-row items-center bg-chat-secondary/50 border border-chat-divider rounded-2xl px-4 py-2.5 gap-3 justify-center">
              <ActivityIndicator size="small" color="#8D6CFF" />
              <Text className="text-sm font-semibold text-zinc-300">
                Uploading voice message...
              </Text>
            </View>
          )}

          {/* 5. Failed Mode (Show Retry & Discard options) */}
          {status === "failed" && (
            <View className="flex-1 flex-row items-center gap-3">
              {/* Discard / Delete Button */}
              <TouchableOpacity
                onPress={handleDiscardRecording}
                className="p-2.5 rounded-full bg-red-500/20 active:bg-red-500/35"
              >
                <Feather name="trash-2" size={18} color="#ef4444" />
              </TouchableOpacity>

              {/* Failed Message Box */}
              <View className="flex-1 flex-row items-center bg-red-500/10 border border-red-500/25 rounded-2xl px-4 py-2 justify-between">
                <View className="flex-row items-center gap-2">
                  <Feather name="alert-circle" size={16} color="#ef4444" />
                  <Text className="text-xs font-semibold text-red-400">
                    Upload Failed
                  </Text>
                </View>

                {/* Retry Trigger */}
                <TouchableOpacity
                  onPress={handleRetryUpload}
                  className="flex-row items-center gap-1 bg-red-500/20 px-3 py-1 rounded-full active:bg-red-500/35"
                >
                  <Feather name="refresh-cw" size={12} color="#ef4444" />
                  <Text className="text-[10px] font-bold text-red-400">
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* Persistent VoiceRecorder for seamless transition without unmounting */}
          {((status === "idle" && !hasText) || (status === "recording" && !isLocked)) && (
            <View
              style={
                status === "recording"
                  ? { position: "absolute", right: 0, top: 0, bottom: 0, justifyContent: "center", zIndex: 50 }
                  : {}
              }
            >
              <VoiceRecorder
                onStart={handleStartRecording}
                onStop={handleStopRecording}
                onCancel={handleCancelRecording}
                onLock={handleLockRecording}
                onPressIn={() => textInputRef.current?.focus()}
                isRecording={isRecording}
                isLocked={isLocked}
              />
            </View>
          )}
        </View>
      </ScrollView>
      </BlurView>
    </View>
  );
};

export default ChatInput;
