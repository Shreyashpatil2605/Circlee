import React from "react";
import { View, Text } from "react-native";
import { BlurView } from "expo-blur";

interface ScreenHeaderProps {
  title: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  intensity?: number;
  className?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  leftSlot,
  rightSlot,
  intensity = 40,
  className = "",
}) => {
  return (
    <View className={`z-10 ${className}`}>
      <BlurView
        intensity={intensity}
        tint="dark"
        className="flex-row items-center justify-between px-5 py-4 border-b border-white/5"
      >
        <View className="flex-row items-center flex-1">
          {leftSlot && <View className="mr-3">{leftSlot}</View>}
          <Text className="text-xl font-bold text-white tracking-tight">
            {title}
          </Text>
        </View>
        {rightSlot && <View className="ml-3">{rightSlot}</View>}
      </BlurView>
    </View>
  );
};

export default ScreenHeader;
