import React from "react";
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
  };
  isOwnMessage: boolean;
  onLongPress?: () => void;
  onSwipe?: (message: any) => void;
  reactions?: string[];
  isGroupedWithPrevious?: boolean;
  isGroupedWithNext?: boolean;
  searchQuery?: string;
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
  isGroupedWithPrevious = false,
  isGroupedWithNext = false,
  searchQuery = "",
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

  const panGesture = Gesture.Pan()
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
      hasTriggeredHaptic.value = false;
    });

  const animatedBubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedIconStyle = useAnimatedStyle(() => {
    const opacity = translateX.value < SWIPE_THRESHOLD ? 1 : Math.min(Math.abs(translateX.value) / 50, 0.6);
    const scale = translateX.value < SWIPE_THRESHOLD ? 1.1 : 0.8 + (Math.min(Math.abs(translateX.value), 50) / 50) * 0.2;
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const getBubbleStyle = () => {
    const defaultRadius = 24;
    const connectedRadius = 8;

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
          marginBottom: isGroupedWithNext ? 2 : 10,
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
        <Animated.View style={[animatedBubbleStyle, { maxWidth: width * 0.78 }]}>
          <TouchableOpacity
            activeOpacity={0.9}
            onLongPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              if (onLongPress) onLongPress();
            }}
            delayLongPress={250}
          >
            {isVoiceMessage ? (
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

            {/* Reaction badge container (if reactions exist) */}
            {reactions.length > 0 && (
              <View
                className={`absolute -bottom-3 bg-chat-secondary border border-chat-divider rounded-full px-2 py-0.5 flex-row items-center gap-1 shadow-md ${
                  isOwnMessage ? "right-3" : "left-3"
                }`}
              >
                {reactions.map((emoji, index) => (
                  <Text key={index} className="text-xs">
                    {emoji}
                  </Text>
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
