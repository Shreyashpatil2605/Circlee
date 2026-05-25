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
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-3 py-2">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3 border border-gray-300">
          <Feather name="search" size={20} color="#9D00FF" />
          <TextInput
            placeholder="Search Circlee"
            className="flex-1 ml-2 text-base text-black"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="p-4">
          <Text className="text-xl font-bold text-black mb-4" style={{ textShadowColor: '#9D00FF', textShadowRadius: 8 }}>
            Trending for you
          </Text>
          {TREADING_TOPICS.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="py-3 border-b border-gray-200"
            >
        
              <Text className="font-bold text-black text-lg">
                {item.topic}
              </Text>
              <Text className="text-gray-600 text-sm mt-1">
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
