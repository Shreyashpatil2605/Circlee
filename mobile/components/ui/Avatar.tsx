import React from "react";
import { View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface AvatarProps {
  uri?: string;
  size?: number;
  isOnline?: boolean;
  hasUnread?: boolean;
  className?: string;
  borderClassName?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  size = 48,
  isOnline = false,
  hasUnread = false,
  className = "",
  borderClassName = "",
}) => {
  const defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120";
  const avatarUrl = uri || defaultAvatar;

  const renderImage = () => (
    <Image
      source={{ uri: avatarUrl }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={`bg-chat-card ${borderClassName}`}
    />
  );

  return (
    <View style={{ width: size, height: size }} className={`relative ${className}`}>
      {hasUnread ? (
        <LinearGradient
          colors={["#0A84FF", "#6B4EFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 2, borderRadius: (size + 4) / 2 }}
        >
          {renderImage()}
        </LinearGradient>
      ) : (
        renderImage()
      )}

      {isOnline && (
        <View
          style={{
            width: size * 0.28,
            height: size * 0.28,
            borderRadius: (size * 0.28) / 2,
            position: "absolute",
            bottom: 0,
            right: 0,
          }}
          className="bg-chat-green border-[3px] border-chat-bg"
        />
      )}
    </View>
  );
};

export default Avatar;
