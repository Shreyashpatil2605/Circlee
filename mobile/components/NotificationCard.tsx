import { Notification } from "@/types";
import { formatDate } from "@/utils/formatters";
import { Feather } from "@expo/vector-icons";
import { View, Text, Alert, Image, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";

interface NotificationCardProps {
  notification: Notification;
  onDelete: (notificationId: string) => void;
}

const NotificationCard = ({ notification, onDelete }: NotificationCardProps) => {
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
        return <Feather name="heart" size={20} color="#9D00FF" />;
      case "comment":
        return <Feather name="message-circle" size={20} color="#9D00FF" />;
      case "follow":
        return <Feather name="user-plus" size={20} color="#9D00FF" />;
      default:
        return <Feather name="bell" size={20} color="#A0AEC0" />;
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Notification", "Are you sure you want to delete this notification?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(notification._id),
      },
    ]);
  };

  return (
    <View className="mb-2 mx-2 rounded-2xl overflow-hidden border border-white/10">
      <BlurView intensity={30} tint="dark" className="flex-row p-4">
        <View className="relative mr-3">
          <Image
            source={{ uri: notification.from.profilePicture }}
            className="size-12 rounded-full border border-neon-purple/50"
          />

          <View className="abolute -bottom-1 -right-1 size-6 bg-black/50 items-center justify-center rounded-full">
            {getNotificationIcon()}
          </View>
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between mb-1">
            <View className="flex-1">
              <Text className="text-white text-base leading-5 mb-1">
                <Text className="font-semibold">
                  {notification.from.firstName} {notification.from.lastName}
                </Text>
                <Text className="text-gray-400"> @{notification.from.username}</Text>
              </Text>
              <Text className="text-gray-300 text-sm mb-2">{getNotificationText()}</Text>
            </View>

            <TouchableOpacity className="ml-2 p-1" onPress={handleDelete}>
              <Feather name="trash" size={16} color="#888" />
            </TouchableOpacity>
          </View>

          {notification.post && (
            <View className="bg-white/5 rounded-lg p-3 mb-2 border border-white/5">
              <Text className="text-gray-300 text-sm mb-1" numberOfLines={3}>
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
              <Text className="text-gray-400 text-xs mb-1">Comment:</Text>
              <Text className="text-gray-300 text-sm" numberOfLines={2}>
                &ldquo;{notification.comment.content}&rdquo;
              </Text>
            </View>
          )}
          <Text className="text-gray-500 text-xs">{formatDate(notification.createdAt)}</Text>
        </View>
      </BlurView>
    </View>
  );
};
export default NotificationCard;