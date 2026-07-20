import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const NoNotificationsFound = () => {
  return (
    <View className="flex-1 items-center justify-center px-6 py-20 bg-transparent">
      <View className="w-full max-w-sm rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
        <BlurView intensity={25} tint="dark" className="p-8 items-center">
          {/* Glowing Icon Container */}
          <View className="relative items-center justify-center w-24 h-24 mb-6">
            <LinearGradient
              colors={["rgba(107, 78, 255, 0.2)", "rgba(10, 132, 255, 0.05)"]}
              className="absolute inset-0 rounded-full"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View className="w-16 h-16 rounded-full bg-white/5 items-center justify-center border border-white/10 shadow-lg">
              <Feather name="bell-off" size={28} color="#A7A7B5" />
            </View>
            {/* Pulsing visual dots */}
            <View className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-[#6B4EFF]/85 border border-[#0F0F1A]" />
          </View>

          {/* Heading */}
          <Text className="text-xl font-bold text-white text-center mb-2">
            Inbox is quiet
          </Text>

          {/* Description */}
          <Text className="text-zinc-400 text-center text-sm leading-5 max-w-[240px]">
            When people like your posts, comment, or start following you, it will show up here.
          </Text>
        </BlurView>
      </View>
    </View>
  );
};

export default NoNotificationsFound;
