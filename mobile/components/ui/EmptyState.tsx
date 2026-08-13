import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

interface EmptyStateProps {
  iconName: any;
  title: string;
  subtitle?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  iconName,
  title,
  subtitle,
  className = "",
}) => {
  return (
    <View className={`flex-1 items-center justify-center p-8 ${className}`}>
      <View className="w-16 h-16 rounded-full bg-white/5 items-center justify-center mb-4 border border-white/10">
        <Feather name={iconName} size={28} color="#6B7280" />
      </View>
      <Text className="text-white text-lg font-bold text-center mb-1">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-zinc-500 text-sm text-center">
          {subtitle}
        </Text>
      )}
    </View>
  );
};

export default EmptyState;
