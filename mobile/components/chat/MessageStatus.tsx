import React from "react";
import { View, Text } from "react-native";

interface MessageStatusProps {
  isOwnMessage: boolean;
  readByCount?: number;
}

export const MessageStatus: React.FC<MessageStatusProps> = ({
  isOwnMessage,
  readByCount = 1,
}) => {
  if (!isOwnMessage) return null;

  // readByCount > 1 means it's read by the other participant
  const isRead = readByCount > 1;

  return (
    <View className="flex-row items-center ml-1">
      {isRead ? (
        // Double check mark in purple
        <View className="flex-row items-center">
          <Text className="text-[10px] text-chat-purple font-semibold">✓✓</Text>
        </View>
      ) : (
        // Double check mark in gray
        <View className="flex-row items-center">
          <Text className="text-[10px] text-chat-text-secondary">✓</Text>
        </View>
      )}
    </View>
  );
};

export default MessageStatus;
