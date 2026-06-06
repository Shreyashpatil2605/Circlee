import { Notification } from "@/types";
import { formatDate } from "@/utils/formatters";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { View, Text, Alert, Image, TouchableOpacity } from "react-native";
interface NotificationCardProps {
  notification: Notification;
  onDelete: (notificationId: string) => void;
}

const NotificationCard = ({
  notification,
  onDelete,
}: NotificationCardProps) => {
  const getNotificationText = () => {
    const name = `${notification.from.firstName} ${notification.from.lastName}`;
    switch (notification.type) {
      case "like":
        return `${name} liked your post`;
      case "comment":
        return `${name} commented on your post`;
      case "follow":
        return `${name} started following you`;
      default:
        return "";
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "like":
        return <Feather name="heart" size={20} color="#0A84FF" />;
      case "comment":
        return <Feather name="message-circle" size={20} color="#0A84FF" />;
      case "follow":
        return <Feather name="user-plus" size={20} color="#0A84FF" />;
      default:
        return <Feather name="bell" size={20} color="#9CA3AF" />;
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(notification._id),
        },
      ],
    );
  };

  return (
    <View className="mb-3 mx-3 rounded-2xl overflow-hidden border border-border-glass-light">
      <BlurView intensity={35} tint="dark" className="flex-row p-4">
        <View className="relative mr-3">
          <Image
            source={{ uri: notification.from.profilePicture }}
            className="size-12 rounded-full border border-accent-blue/30"
          />

          <View className="absolute -bottom-1 -right-1 size-6 bg-glass-light items-center justify-center rounded-full border border-border-glass-highlight">
            {getNotificationIcon()}
          </View>
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <Text className="text-text-secondary text-base leading-5 mb-1">
                <Text className="font-semibold text-text-primary">
                  {notification.from.firstName} {notification.from.lastName}
                </Text>
                <Text className="text-text-tertiary">
                  {" "}
                  @{notification.from.username}
                </Text>
              </Text>
              <Text className="text-text-tertiary text-sm mb-2">
                {getNotificationText()}
              </Text>
            </View>

            <TouchableOpacity className="ml-2 p-1" onPress={handleDelete}>
              <Feather name="trash" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {notification.post && (
            <View className="bg-glass-light rounded-lg p-3 mb-2 border border-border-glass-medium">
              <Text
                className="text-text-secondary text-sm mb-2"
                numberOfLines={3}
              >
                {notification.post.content}
              </Text>
              {notification.post.image && (
                <Image
                  source={{ uri: notification.post.image }}
                  className="w-full h-32 rounded-lg mt-2"
                  resizeMode="cover"
                />
              )}
            </View>
          )}
          {notification.comment && (
            <View className="bg-neon-purple-dim rounded-lg p-3 mb-2 border border-neon-purple/10">
              <Text className="text-gray-600 text-xs mb-1">Comment:</Text>
              <Text className="text-gray-700 text-sm" numberOfLines={2}>
                &ldquo;{notification.comment.content}&rdquo;
              </Text>
            </View>
          )}
          <Text className="text-gray-600 text-xs">
            {formatDate(notification.createdAt)}
          </Text>
        </View>
      </BlurView>
    </View>
  );
};
export default NotificationCard;
