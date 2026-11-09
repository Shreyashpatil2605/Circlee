import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  ScrollView,
  Keyboard,
  Platform,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
  isEmojiPickerOpen?: boolean;
  setIsEmojiPickerOpen?: (open: boolean) => void;
  keyboardHeight?: number;
}

const EMOJI_CATEGORIES = [
  {
    id: "smileys",
    name: "Smileys",
    symbol: "😊",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣",
      "🥲", "🥹", "😊", "😇", "🙂", "🙃", "😉", "😌",
      "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛",
      "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸",
      "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕",
      "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢",
      "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵",
      "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔",
      "🫣", "🤭", "🫢", "🫡", "🤫", "🫠", "🤥", "😶",
      "😐", "😑", "😬", "🫨", "🙄", "😯", "😦", "😧",
      "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐",
      "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑",
      "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻",
    ],
  },
  {
    id: "gestures",
    name: "Hands",
    symbol: "👍",
    emojis: [
      "👍", "👎", "👏", "🙌", "👐", "🤲", "🤝", "🙏",
      "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉",
      "👆", "🖕", "👇", "☝️", "🫵", "👋", "🤚", "🖐️",
      "✋", "🖖", "🫱", "🫲", "🫳", "🫴", "👊", "✊",
      "🤛", "🤜", "🫷", "🫸", "💪", "🦾", "✍️", "🫶",
      "💅", "🤳", "👂", "👃", "👀", "👁️", "👅", "👄",
      "🫦", "🧠", "🫀", "🫁", "👤", "👥", "🫂",
    ],
  },
  {
    id: "hearts",
    name: "Hearts",
    symbol: "❤️",
    emojis: [
      "❤️", "🩷", "🧡", "💛", "💚", "💙", "🩵", "💜",
      "🤎", "🖤", "🩶", "🤍", "💔", "❤️‍🔥", "❤️‍🩹", "❣️",
      "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟",
      "💌", "💋", "💐", "🌹", "🥀", "🌺", "🌸", "🌷",
    ],
  },
  {
    id: "vibes",
    name: "Vibes",
    symbol: "🔥",
    emojis: [
      "🔥", "✨", "⚡", "💥", "🌟", "⭐", "🌈", "☀️",
      "🌙", "🪐", "🚀", "🛸", "🎉", "🎊", "🎈", "🍾",
      "🥂", "🍻", "🍺", "🍸", "🍹", "🏆", "🥇", "🥈",
      "🥉", "🎯", "🎲", "🎰", "🎮", "🕹️", "👾", "👑",
      "💎", "💯", "💢", "💫", "💨", "🌊", "🫧", "🎵",
      "🎶", "🎸", "🎹", "🥁", "🎤", "🎧", "📸", "🍿",
    ],
  },
  {
    id: "food",
    name: "Food",
    symbol: "🍕",
    emojis: [
      "🍕", "🍔", "🍟", "🌭", "🍿", "🧈", "🥞", "🧇",
      "🥓", "🍳", "🥖", "🥐", "🍞", "🧀", "🥗", "🥙",
      "🥪", "🌮", "🌯", "🍣", "🍱", "🥟", "🍜", "🍲",
      "🍩", "🍪", "🎂", "🍰", "🧁", "🍫", "🍬", "🍭",
      "☕", "🧋", "🍵", "🥤", "🧃", "🧊", "🍺", "🍷",
    ],
  },
  {
    id: "nature",
    name: "Nature",
    symbol: "🐶",
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
      "🐻‍❄️", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵",
      "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇",
      "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋",
      "🐌", "🐞", "🐜", "🪰", "🪲", "🪳", "🪴", "🌲",
      "🌳", "🌴", "🌵", "🌾", "🌿", "☘️", "🍀", "🍁",
    ],
  },
  {
    id: "objects",
    name: "Objects",
    symbol: "💡",
    emojis: [
      "💡", "🔦", "🕯️", "📱", "💻", "⌨️", "🖥️", "🖨️",
      "⏰", "⏱️", "⏳", "⌛", "📡", "🔋", "🔌", "💸",
      "💵", "💳", "💰", "🪙", "📦", "📫", "📬", "✉️",
      "📝", "✏️", "✒️", "📌", "📍", "📎", "🔑", "🗝️",
      "🔒", "🔓", "🔔", "🔕", "🛡️", "⚔️", "💣", "🧯",
    ],
  },
];

const EmojiItem = React.memo(
  ({
    emoji,
    onSelect,
  }: {
    emoji: string;
    onSelect: (emoji: string) => void;
  }) => {
    return (
      <TouchableOpacity
        onPress={() => onSelect(emoji)}
        delayPressIn={0}
        activeOpacity={0.6}
        style={styles.emojiButton}
      >
        <Text style={styles.emojiText}>{emoji}</Text>
      </TouchableOpacity>
    );
  }
);
EmojiItem.displayName = "EmojiItem";

const EmojiCategoryTab = React.memo(
  ({
    symbol,
    name,
    isActive,
    onPress,
  }: {
    symbol: string;
    name: string;
    isActive: boolean;
    onPress: () => void;
  }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        delayPressIn={0}
        activeOpacity={0.7}
        style={[styles.categoryTab, isActive && styles.activeCategoryTab]}
      >
        <Text style={styles.categorySymbol}>{symbol}</Text>
        <Text
          style={[styles.categoryName, isActive && styles.activeCategoryName]}
        >
          {name}
        </Text>
      </TouchableOpacity>
    );
  }
);
EmojiCategoryTab.displayName = "EmojiCategoryTab";

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  onAttachmentPress,
  onVoicePress,
  onEmojiPress,
  onSendVoice,
  isSending = false,
  isEmojiPickerOpen: controlledEmojiOpen,
  setIsEmojiPickerOpen: setControlledEmojiOpen,
  keyboardHeight: customKeyboardHeight,
}) => {
  const hasText = value.trim().length > 0;
  const api = useApiClient();
  const textInputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [internalEmojiOpen, setInternalEmojiOpen] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  const isEmojiPickerOpen =
    controlledEmojiOpen !== undefined ? controlledEmojiOpen : internalEmojiOpen;
  const setIsEmojiPickerOpen = setControlledEmojiOpen || setInternalEmojiOpen;

  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeTextRef = useRef(onChangeText);
  onChangeTextRef.current = onChangeText;

  const backspaceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
      if (backspaceIntervalRef.current) {
        clearInterval(backspaceIntervalRef.current);
      }
    };
  }, []);

  const bottomPadding = isEmojiPickerOpen
    ? 0
    : isKeyboardVisible
    ? Platform.OS === "android"
      ? 0
      : 4
    : Math.max(insets.bottom, 6);

  const panelHeight =
    customKeyboardHeight && customKeyboardHeight > 100
      ? customKeyboardHeight
      : Platform.OS === "ios"
      ? 336
      : 290;

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
    setIsEmojiPickerOpen(false);
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

  const handleDiscardRecording = () => {
    cancel();
    setStatus("idle");
    setRecordedUri(null);
    setWaveform([]);
    setIsLocked(false);
  };

  const handleSendVoice = async () => {
    if (!recordedUri) return;
    setStatus("uploading");

    try {
      const formData = new FormData();
      const filename = recordedUri.split("/").pop() || "recording.m4a";
      formData.append("file", {
        uri: recordedUri,
        name: filename,
        type: "audio/m4a",
      } as any);

      const response = await api.post("/uploads/voice", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const audioUrl = response.data?.url || response.data?.secure_url;
      if (!audioUrl) throw new Error("No URL returned from upload server");

      const attachment = {
        type: "voice",
        url: audioUrl,
        metadata: {
          duration: durationSeconds,
          waveform: waveform,
        },
      };

      if (onSendVoice) {
        await onSendVoice([attachment]);
      }

      handleDiscardRecording();
    } catch (err) {
      console.error("Voice upload failed:", err);
      setStatus("failed");
    }
  };

  const handleRetryUpload = () => {
    handleSendVoice();
  };

  const handleTextSend = () => {
    onSend();
  };

  const handleToggleEmojiPicker = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isEmojiPickerOpen) {
      // Transition smoothly back to keyboard
      textInputRef.current?.focus();
    } else {
      // Dismiss keyboard and reveal emoji board seamlessly
      Keyboard.dismiss();
      setIsEmojiPickerOpen(true);
    }
    if (onEmojiPress) {
      onEmojiPress();
    }
  };

  const handleSelectEmoji = useCallback((emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChangeTextRef.current(valueRef.current + emoji);
  }, []);

  const handleDeleteEmoji = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const cur = valueRef.current;
    if (!cur) return;
    const chars = Array.from(cur);
    chars.pop();
    onChangeTextRef.current(chars.join(""));
  }, []);

  const handleBackspaceStart = useCallback(() => {
    handleDeleteEmoji();
    backspaceIntervalRef.current = setInterval(() => {
      handleDeleteEmoji();
    }, 110);
  }, [handleDeleteEmoji]);

  const handleBackspaceEnd = useCallback(() => {
    if (backspaceIntervalRef.current) {
      clearInterval(backspaceIntervalRef.current);
      backspaceIntervalRef.current = null;
    }
  }, []);

  return (
    <View
      className="w-full border-t border-chat-divider bg-chat-bg"
      style={{ paddingBottom: bottomPadding }}
    >
      <BlurView
        intensity={80}
        tint="dark"
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: "rgba(11, 11, 18, 0.6)",
        }}
      >
        <View className="flex-row items-center gap-2 relative w-full">
          {/* 1. Normal Mode (Idle or Recording) */}
          {(status === "idle" || status === "recording") && (
            <>
              {/* Emoji Button */}
              <TouchableOpacity
                onPress={handleToggleEmojiPicker}
                activeOpacity={0.7}
                className={`p-2 rounded-full ${
                  isEmojiPickerOpen
                    ? "bg-chat-purple/30 border border-chat-purple"
                    : "bg-chat-secondary/40"
                }`}
              >
                {isEmojiPickerOpen ? (
                  <MaterialCommunityIcons
                    name="keyboard-outline"
                    size={20}
                    color="#8D6CFF"
                  />
                ) : (
                  <Feather name="smile" size={20} color="#A7A7B5" />
                )}
              </TouchableOpacity>

              {/* Attachment Plus Button */}
              <TouchableOpacity
                onPress={() => {
                  setIsEmojiPickerOpen(false);
                  onAttachmentPress?.();
                }}
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
                  onPress={() => {
                    setIsEmojiPickerOpen(false);
                    onAttachmentPress?.();
                  }}
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
          {((status === "idle" && !hasText) ||
            (status === "recording" && !isLocked)) && (
            <View
              style={
                status === "recording"
                  ? {
                      position: "absolute",
                      right: 0,
                      top: 0,
                      bottom: 0,
                      justifyContent: "center",
                      zIndex: 50,
                    }
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
      </BlurView>

      {/* 6. Built-in Zero-Jump Emoji Keyboard Board */}
      {isEmojiPickerOpen && (
        <View style={[styles.emojiPanelContainer, { height: panelHeight }]}>
          {/* Categories Tab Bar & Rapid Backspace */}
          <View style={styles.emojiCategoryRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
              keyboardShouldPersistTaps="always"
            >
              {EMOJI_CATEGORIES.map((cat, idx) => (
                <EmojiCategoryTab
                  key={cat.id}
                  symbol={cat.symbol}
                  name={cat.name}
                  isActive={activeCategoryIndex === idx}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveCategoryIndex(idx);
                  }}
                />
              ))}
            </ScrollView>

            {/* Backspace Button with long-press continuous delete */}
            <TouchableOpacity
              onPress={handleDeleteEmoji}
              onPressIn={handleBackspaceStart}
              onPressOut={handleBackspaceEnd}
              activeOpacity={0.7}
              style={styles.deleteButton}
            >
              <Feather name="delete" size={18} color="#A7A7B5" />
            </TouchableOpacity>
          </View>

          {/* Emoji Grid Scroll with edge-to-edge safe area */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.emojiGridContainer,
              { paddingBottom: insets.bottom + 16 },
            ]}
            keyboardShouldPersistTaps="always"
          >
            <View style={styles.emojiGrid}>
              {EMOJI_CATEGORIES[activeCategoryIndex].emojis.map(
                (emoji, index) => (
                  <EmojiItem
                    key={`${emoji}-${index}`}
                    emoji={emoji}
                    onSelect={handleSelectEmoji}
                  />
                )
              )}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  emojiPanelContainer: {
    backgroundColor: "#0B0B10",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  emojiCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
    backgroundColor: "#14141C",
  },
  categoryScroll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  activeCategoryTab: {
    backgroundColor: "rgba(139, 92, 246, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.5)",
  },
  categorySymbol: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#A7A7B5",
  },
  activeCategoryName: {
    color: "#A78BFA",
    fontWeight: "700",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginLeft: 8,
  },
  emojiGridContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  emojiButton: {
    width: "12.5%", // 8 emojis per row
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiText: {
    fontSize: 27,
  },
});

export default ChatInput;
