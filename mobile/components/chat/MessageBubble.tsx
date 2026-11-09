import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import Animated, {
  FadeInLeft,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { format } from "date-fns";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { MessageStatus } from "./MessageStatus";
import { VoiceBubble } from "./VoiceBubble";

interface MessageBubbleProps {
  message: {
    _id: string;
    content: string;
    createdAt: number;
    senderId: string;
    readBy?: string[];
    type?: string;
    audioUrl?: string;
    attachments?: { type: string; url: string; metadata?: any }[];
    deletedForEveryone?: boolean;
    reactions?: { emoji: string; userId: string }[];
  };
  isOwnMessage: boolean;
  onLongPress?: () => void;
  onSwipe?: (message: any) => void;
  reactions?: { emoji: string; userId: string }[] | string[];
  currentUserId?: string;
  onReactionPress?: (emoji: string) => void;
  isGroupedWithPrevious?: boolean;
  isGroupedWithNext?: boolean;
  searchQuery?: string;
  isHighlighted?: boolean;
}

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = -50;

const escapeRegExp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  onLongPress,
  onSwipe,
  reactions = [],
  currentUserId,
  onReactionPress,
  isGroupedWithPrevious = false,
  isGroupedWithNext = false,
  searchQuery = "",
  isHighlighted = false,
}) => {
  const formattedTime = format(new Date(message.createdAt), "p");
  const readCount = message.readBy?.length || 1;
  const isVoiceMessage =
    message.type === "voice" ||
    message.content.startsWith("[Voice Message]") ||
    (message.attachments && (message.attachments as any[]).some((a) => a.type === "voice"));

  // Swipe translation shared value
  const translateX = useSharedValue(0);
  const hasTriggeredHaptic = useSharedValue(false);

  const triggerSwipeCallback = () => {
    if (onSwipe) {
      onSwipe(message);
    }
  };

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const isDeleted = message.deletedForEveryone === true;

  // Compute grouped reactions with counts and current-user participation
  const rawReactions = reactions && reactions.length > 0 ? reactions : message.reactions || [];

  const groupedReactions = useMemo(() => {
    if (!rawReactions || !Array.isArray(rawReactions) || rawReactions.length === 0) {
      return [];
    }

    const map = new Map<string, { count: number; hasUserReacted: boolean }>();

    for (const item of rawReactions) {
      if (!item) continue;
      const emoji = typeof item === "string" ? item : item.emoji;
      const userId = typeof item === "string" ? null : item.userId;

      if (!emoji) continue;

      const existing = map.get(emoji) || { count: 0, hasUserReacted: false };
      existing.count += 1;
      if (currentUserId && userId && userId === currentUserId) {
        existing.hasUserReacted = true;
      }
      map.set(emoji, existing);
    }

    return Array.from(map.entries()).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      hasUserReacted: data.hasUserReacted,
    }));
  }, [rawReactions, currentUserId]);

  const panGesture = Gesture.Pan()
    .enabled(!isDeleted)
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      if (event.translationX < 0) {
        const dragX = event.translationX;
        translateX.value = dragX < -80 ? -80 + (dragX + 80) * 0.2 : dragX;

        if (dragX < SWIPE_THRESHOLD && !hasTriggeredHaptic.value) {
          hasTriggeredHaptic.value = true;
          runOnJS(triggerHaptic)();
        } else if (dragX > SWIPE_THRESHOLD && hasTriggeredHaptic.value) {
          hasTriggeredHaptic.value = false;
        }
      }
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        runOnJS(triggerSwipeCallback)();
      }
      translateX.value = withSpring(0);
    });

  const animatedBubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedIconStyle = useAnimatedStyle(() => {
    const opacity = Math.min(Math.abs(translateX.value) / Math.abs(SWIPE_THRESHOLD), 1);
    const scale = Math.min(Math.abs(translateX.value) / Math.abs(SWIPE_THRESHOLD), 1);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const getBubbleStyle = () => {
    const defaultRadius = 18;
    const connectedRadius = 4;

    if (isOwnMessage) {
      return {
        borderTopLeftRadius: defaultRadius,
        borderBottomLeftRadius: defaultRadius,
        borderTopRightRadius: isGroupedWithPrevious ? connectedRadius : defaultRadius,
        borderBottomRightRadius: isGroupedWithNext ? connectedRadius : defaultRadius,
      };
    } else {
      return {
        borderTopRightRadius: defaultRadius,
        borderBottomRightRadius: defaultRadius,
        borderTopLeftRadius: isGroupedWithPrevious ? connectedRadius : defaultRadius,
        borderBottomLeftRadius: isGroupedWithNext ? connectedRadius : defaultRadius,
      };
    }
  };

  const renderContent = () => {
    if (!searchQuery.trim()) {
      return (
        <Text className="text-chat-text-primary text-[15px] leading-5">
          {message.content}
        </Text>
      );
    }

    const escaped = escapeRegExp(searchQuery.trim());
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = message.content.split(regex);

    return (
      <Text className="text-chat-text-primary text-[15px] leading-5">
        {parts.map((part, index) =>
          regex.test(part) ? (
            <Text key={index} className="bg-chat-purple/40 text-[#FFD54F] font-bold px-0.5 rounded">
              {part}
            </Text>
          ) : (
            <Text key={index}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  const enteringAnimation = isOwnMessage
    ? FadeInRight.springify().mass(0.6).damping(12)
    : FadeInLeft.springify().mass(0.6).damping(12);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        entering={enteringAnimation}
        className="px-4 flex-row relative"
        style={{
          marginBottom: (isGroupedWithNext ? 2 : 8) + (groupedReactions.length > 0 ? 12 : 0),
          justifyContent: isOwnMessage ? "flex-end" : "flex-start",
        }}
      >
        {/* Reply Indicator Behind Bubble */}
        <Animated.View
          style={[styles.replyIndicator, animatedIconStyle]}
          className="absolute right-6 top-0 bottom-0 justify-center"
        >
          <View className="w-8 h-8 rounded-full bg-chat-purple/35 items-center justify-center border border-chat-purple/20">
            <Feather name="corner-up-left" size={14} color="#8D6CFF" />
          </View>
        </Animated.View>

        {/* Message Content Container */}
        <Animated.View
          style={[
            animatedBubbleStyle,
            { maxWidth: width * 0.78 },
            isHighlighted && {
              borderRadius: 22,
              borderWidth: 2,
              borderColor: "#A855F7",
              shadowColor: "#A855F7",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 10,
              elevation: 6,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onLongPress={() => {
              if (isDeleted) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              if (onLongPress) onLongPress();
            }}
            delayLongPress={250}
          >
            {isDeleted ? (
              <View
                className={isOwnMessage ? "bg-chat-purple/10 border border-chat-purple/20" : "bg-chat-card border border-chat-divider"}
                style={[
                  getBubbleStyle(),
                  {
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                  },
                ]}
              >
                <Text className="text-chat-text-secondary/70 text-[15px] italic">
                  This message was deleted
                </Text>
                <View className="flex-row items-center justify-end mt-1.5 self-end">
                  <Text className="text-[10px] text-chat-text-secondary/50">
                    {formattedTime}
                  </Text>
                </View>
              </View>
            ) : isVoiceMessage ? (
              <VoiceBubble
                message={message as any}
                isOwnMessage={isOwnMessage}
                getBubbleRadiusStyle={getBubbleStyle}
                formattedTime={formattedTime}
                readCount={readCount}
              />
            ) : isOwnMessage ? (
              <LinearGradient
                colors={["#6B4EFF", "#8D6CFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  getBubbleStyle(),
                  {
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    shadowColor: "#6B4EFF",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    elevation: 2,
                  },
                ]}
              >
                {renderContent()}
                <View className="flex-row items-center justify-end mt-1.5 self-end">
                  <Text className="text-[10px] text-chat-text-primary/75">
                    {formattedTime}
                  </Text>
                  <MessageStatus isOwnMessage={true} readByCount={readCount} />
                </View>
              </LinearGradient>
            ) : (
              <View
                className="bg-chat-card border border-chat-divider"
                style={[
                  getBubbleStyle(),
                  {
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 1,
                  },
                ]}
              >
                {renderContent()}
                <View className="flex-row items-center justify-end mt-1.5 self-end">
                  <Text className="text-[10px] text-chat-text-secondary">
                    {formattedTime}
                  </Text>
                </View>
              </View>
            )}

            {/* Reaction badges container (if reactions exist) */}
            {groupedReactions.length > 0 && !isDeleted && (
              <View
                className={`absolute -bottom-3.5 flex-row items-center gap-1.5 z-20 ${
                  isOwnMessage ? "right-2" : "left-2"
                }`}
              >
                {groupedReactions.map((group) => (
                  <TouchableOpacity
                    key={group.emoji}
                    activeOpacity={0.75}
                    onPress={() => onReactionPress?.(group.emoji)}
                    hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                    style={{
                      shadowColor: group.hasUserReacted ? "#8B5CF6" : "#000000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: group.hasUserReacted ? 0.35 : 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                    className={`flex-row items-center px-2 py-0.5 rounded-full border ${
                      group.hasUserReacted
                        ? "bg-[#6B4EFF]/25 border-[#8B5CF6]"
                        : "bg-[#1B1B25] border-[#272733]"
                    }`}
                  >
                    <Text className="text-xs">{group.emoji}</Text>
                    <Text
                      className={`text-[11px] ml-1 font-bold ${
                        group.hasUserReacted
                          ? "text-[#C4B5FD]"
                          : "text-[#A1A1AA]"
                      }`}
                    >
                      {group.count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  replyIndicator: {
    position: "absolute",
    right: 12,
    zIndex: -1,
  },
});

export default MessageBubble;
