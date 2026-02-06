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
    <SafeAreaView className="flex-1 bg-white" >
      {/* Header */}
      <View className="px-1 py-0.7  border-grey-100">
        <View className="flex-row items-center bg-grey-100 rounded-full px-4 py-3">
          <Feather name="search" size={20} color="#657786" />
          <TextInput
            placeholder="Search Circlee"
            className="flex-1 ml-2 text-base"
            placeholderTextColor="#657786"
          />
        </View>
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          <Text className="text-xl font-bold text-gray-500 mb-4 ">
            Treading for you
          </Text>
          {TREADING_TOPICS.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="py-3 boder-b border-gray-300"
            >
        
              <Text className=" font-bold text-gray-900 text-lg ">
                {item.topic}
              </Text>
              <Text className=" font-bold text-gray-300 text-lg ">
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
