import { View, Text, Alert, Image } from "react-native";
import React from "react";
import { Notification } from "@/types";
import { Feather } from "@expo/vector-icons";
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
        return `${name} liked your post.`;
      case "comment":
        return `${name} commented on your post.`;
      case "follow":
        return `${name} started following you.`;
      default:
        return " ";
    }
  };
  const getNotificationIcon = () => {
    switch (notification.type) {
      case "like":
        return <Feather name="heart" size={20} color="#E0245E" />;
      case "follow":
        return <Feather name="user-plus" size={20} color="#17BF63" />;
      case "comment":
        return <Feather name="message-circle" size={20} color="#1DA1F2" />;
      default:
        return <Feather name="bell" size={20} color="#657786"></Feather>;
    }
  };

  const handledelete = () => {
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

  return;
  <View className="border-b border-gray-100 bg-white">
    <View className="flex-row p-4">
      <View className="relative mr-5">
        <Image source={{ uri: notification.from.profilePicture }} />
        <View className="abolute  -bottom-1 items-center justify-center">
          {getNotificationIcon()}
        </View>
      </View>
    </View>
  </View>;
};

export default NotificationCard;
