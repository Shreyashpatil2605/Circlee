import React from "react";
import { View, Text, Image, Dimensions } from "react-native";
import { Notification, NotificationType } from "@/types";
import { formatDate } from "@/utils/formatters";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
  runOnJS,
  FadeInRight,
  FadeOutLeft,
  LinearTransition,
} from "react-native-reanimated";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface NotificationCardProps {
  notification: Notification;
  onDelete: (notificationId: string) => void;
  onPress: (notification: Notification) => void;
  index: number;
}

const NotificationCard = React.memo(({
  notification,
  onDelete,
  onPress,
  index,
}: NotificationCardProps) => {
  const translateX = useSharedValue(0);
  const hasTriggeredHaptic = useSharedValue(false);

  const getNotificationDetails = () => {
    switch (notification.type) {
      case NotificationType.LIKE:
        return {
          text: "liked your post",
          icon: "heart" as const,
          gradient: ["#FF2D55", "#FF9500"] as [string, string],
          iconColor: "#FFFFFF",
        };
      case NotificationType.COMMENT:
        return {
          text: "commented on your post",
          icon: "message-circle" as const,
          gradient: ["#9B51E0", "#E040FB"] as [string, string],
          iconColor: "#FFFFFF",
        };
      case NotificationType.FOLLOW:
        return {
          text: "started following you",
          icon: "user-plus" as const,
          gradient: ["#007AFF", "#00C7BE"] as [string, string],
          iconColor: "#FFFFFF",
        };
      case NotificationType.MESSAGE:
        return {
          text: "sent you a message",
          icon: "mail" as const,
          gradient: ["#34C759", "#00C7BE"] as [string, string],
          iconColor: "#FFFFFF",
        };
      case NotificationType.VOICE_MESSAGE:
        return {
          text: "sent you a voice message",
          icon: "mic" as const,
          gradient: ["#FF9500", "#FFCC00"] as [string, string],
          iconColor: "#FFFFFF",
        };
      default:
        return {
          text: "",
          icon: "bell" as const,
          gradient: ["#8E8E93", "#C7C7CC"] as [string, string],
          iconColor: "#FFFFFF",
        };
    }
  };

  const details = getNotificationDetails();

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleDelete = () => {
    onDelete(notification._id);
  };

  const handleTap = () => {
    onPress(notification);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // prevent accidental swipes while scrolling vertically
    .onUpdate((event) => {
      translateX.value = Math.min(0, event.translationX);

      if (translateX.value < -90 && !hasTriggeredHaptic.value) {
        hasTriggeredHaptic.value = true;
        runOnJS(triggerHaptic)();
      } else if (translateX.value >= -90 && hasTriggeredHaptic.value) {
        hasTriggeredHaptic.value = false;
      }
    })
    .onEnd(() => {
      if (translateX.value < -110) {
        translateX.value = withTiming(-SCREEN_WIDTH - 20, { duration: 250 }, (finished) => {
          if (finished) {
            runOnJS(handleDelete)();
          }
        });
      } else {
        translateX.value = withSpring(0);
        hasTriggeredHaptic.value = false;
      }
    });

  const tapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(() => {
      runOnJS(handleTap)();
    });

  // Compose tap and pan gestures so they don't block each other
  const composedGesture = Gesture.Exclusive(panGesture, tapGesture);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const trashScale = useDerivedValue(() => {
    return withSpring(translateX.value < -90 ? 1.25 : 0.95);
  });

  const animatedTrashStyle = useAnimatedStyle(() => ({
    transform: [{ scale: trashScale.value }],
    opacity: withTiming(translateX.value < -20 ? 1 : 0, { duration: 100 }),
  }));

  const deleteBgStyle = useAnimatedStyle(() => ({
    opacity: withTiming(translateX.value < -2 ? 1 : 0, { duration: 100 }),
  }));

  const defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120";

  return (
    <Animated.View
      entering={FadeInRight.duration(400).delay(index * 40)}
      exiting={FadeOutLeft.duration(200)}
      layout={LinearTransition.springify()}
      className="mb-3.5 mx-4 relative overflow-hidden rounded-2xl"
    >
      {/* Background deletion reveal */}
      <Animated.View
        style={deleteBgStyle}
        className="absolute inset-0 bg-[#FF3B30]/90 flex-row items-center justify-end px-8 rounded-2xl z-0"
      >
        <Animated.View style={animatedTrashStyle} className="items-center">
          <Feather name="trash-2" size={24} color="#FFFFFF" />
          <Text className="text-white/80 text-[10px] font-bold mt-1 uppercase tracking-wider">
            Delete
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Main Glassmorphic Notification Card */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={animatedCardStyle}>
          <BlurView intensity={28} tint="dark" className="flex-row p-4 border border-white/5 bg-black/25 rounded-2xl relative">
            {/* Unread Indicator Dot */}
            {!notification.read && (
              <View className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-[#007AFF] z-10 shadow shadow-[#007AFF]/50" />
            )}

            {/* Avatar block with status badge */}
            <View className="relative mr-3.5">
              <Image
                source={{ uri: notification.from.profilePicture || defaultAvatar }}
                className="w-12 h-12 rounded-full border border-white/10"
              />
              <LinearGradient
                colors={details.gradient}
                className="absolute -bottom-1 -right-1 w-6 h-6 items-center justify-center rounded-full border-2 border-[#0B0B12]"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Feather name={details.icon} size={11} color={details.iconColor} />
              </LinearGradient>
            </View>

            {/* Notification content */}
            <View className="flex-1">
              <View className="flex-row items-baseline justify-between mb-1">
                {/* User info */}
                <View className="flex-1 flex-row items-baseline flex-wrap pr-4">
                  <Text className="font-bold text-white text-base mr-1">
                    {notification.from.firstName} {notification.from.lastName}
                  </Text>
                  <Text className="text-zinc-500 text-xs font-medium">
                    @{notification.from.username}
                  </Text>
                </View>
                {/* Timestamp */}
                <Text className="text-zinc-500 text-xs font-semibold ml-2">
                  {formatDate(notification.createdAt)}
                </Text>
              </View>

              {/* Action Text */}
              <Text className="text-zinc-300 text-sm leading-relaxed mb-2.5">
                {details.text}
              </Text>

              {/* Optional Post Preview */}
              {notification.post && (
                <View className="bg-white/5 rounded-xl p-3 mb-1 border border-white/5 overflow-hidden">
                  <BlurView intensity={5} tint="light" className="absolute inset-0" />
                  <Text className="text-zinc-300 text-xs leading-relaxed" numberOfLines={3}>
                    {notification.post.content}
                  </Text>
                  {notification.post.image && (
                    <Image
                      source={{ uri: notification.post.image }}
                      className="w-full h-36 rounded-lg mt-2.5"
                      resizeMode="cover"
                    />
                  )}
                </View>
              )}

              {/* Optional Comment Preview */}
              {notification.comment && (
                <View className="bg-[#6B4EFF]/5 rounded-xl p-3 mb-1 border border-[#6B4EFF]/10 overflow-hidden">
                  <Text className="text-purple-400/70 text-[10px] font-bold uppercase tracking-wider mb-1">
                    Comment
                  </Text>
                  <Text className="text-zinc-200 text-xs italic leading-relaxed" numberOfLines={2}>
                    &ldquo;{notification.comment.content}&rdquo;
                  </Text>
                </View>
              )}
            </View>
          </BlurView>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
});

NotificationCard.displayName = "NotificationCard";

export default NotificationCard;
