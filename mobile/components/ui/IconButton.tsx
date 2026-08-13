import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface IconButtonProps extends TouchableOpacityProps {
  iconName: any; // Feather icon name
  iconSize?: number;
  iconColor?: string;
  className?: string;
  bgClassName?: string;
  hapticFeedback?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  iconName,
  iconSize = 20,
  iconColor = "#0A84FF",
  className = "",
  bgClassName = "bg-white/5 border border-white/10",
  onPress,
  hapticFeedback = true,
  ...props
}) => {
  const handlePress = (e: any) => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (onPress) {
      onPress(e);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`w-10 h-10 rounded-full items-center justify-center ${bgClassName} ${className}`}
      activeOpacity={0.7}
      {...props}
    >
      <Feather name={iconName} size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
};

export default IconButton;
