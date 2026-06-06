import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
//todo: add serch feature

const TREADING_TOPICS = [
  { topic: "#ReactNative", tweets: "125K" },
  { topic: "#TypeScript", tweets: "89K" },
  { topic: "#WebDevelopment", tweets: "234K" },
  { topic: "#AI", tweets: "567K" },
  { topic: "#TechNews", tweets: "98K" },
];

const searchScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={["top"]}>
      {/* Header */}
      <View className="px-3 py-3">
        <View className="flex-row items-center bg-glass-light rounded-full px-4 py-3 border border-border-glass-medium">
          <Feather name="search" size={20} color="#0A84FF" />
          <TextInput
            placeholder="Search Circlee"
            className="flex-1 ml-3 text-base text-text-primary"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>
      <ScrollView
        className="flex-1 bg-dark-bg"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="p-4">
          <Text
            className="text-xl font-bold text-text-primary mb-4"
            style={{ textShadowColor: "#0A84FF", textShadowRadius: 8 }}
          >
            Trending for you
          </Text>
          {TREADING_TOPICS.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="py-3 border-b border-border-glass-light"
            >
              <Text className="font-bold text-text-primary text-lg">
                {item.topic}
              </Text>
              <Text className="text-text-tertiary text-sm mt-1">
                {item.tweets} Tweets
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default searchScreen;
