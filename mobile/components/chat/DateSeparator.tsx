import React from "react";
import { View, Text } from "react-native";
import { BlurView } from "expo-blur";

interface DateSeparatorProps {
  label: string;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({ label }) => {
  return (
    <View className="items-center my-5">
      <View className="bg-chat-secondary/60 border border-chat-divider rounded-full overflow-hidden">
        <BlurView
          intensity={30}
          tint="dark"
          style={{ paddingHorizontal: 16, paddingVertical: 6 }}
        >
          <Text className="text-chat-text-secondary text-[11px] font-semibold tracking-wider uppercase">
            {label}
          </Text>
        </BlurView>
      </View>
    </View>
  );
};

export default DateSeparator;
