import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSearchUsers } from "@/hooks/useSearchUsers";
import { useDebounce } from "use-debounce";

const TRENDING_TOPICS = [
  { topic: "#ReactNative", tweets: "125K" },
  { topic: "#TypeScript", tweets: "89K" },
  { topic: "#WebDevelopment", tweets: "234K" },
  { topic: "#AI", tweets: "567K" },
  { topic: "#TechNews", tweets: "98K" },
];

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const [debouncedQuery] = useDebounce(searchQuery, 500);

  const { users, isLoading } = useSearchUsers(debouncedQuery);

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={["top"]}>
      {/* Search Header */}
      <View className="px-4 py-3">
        <View className="flex-row items-center bg-glass-light rounded-full px-4 py-3 border border-border-glass-medium">
          <Feather name="search" size={20} color="#0A84FF" />

          <TextInput
            placeholder="Search Circlee"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-base text-text-primary"
            placeholderTextColor="#9CA3AF"
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-dark-bg"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {searchQuery.trim() ? (
          <View className="px-4">
            {isLoading ? (
              <View className="items-center mt-10">
                <ActivityIndicator size="large" color="#0A84FF" />
              </View>
            ) : users.length === 0 ? (
              <View className="items-center mt-10">
                <Text className="text-text-tertiary text-base">
                  No users found
                </Text>
              </View>
            ) : (
              users.map((user: any) => (
                <TouchableOpacity
                  key={user._id}
                  onPress={() => router.push(`/${user.username}`)}
                  className="flex-row items-center py-4 border-b border-border-glass-light"
                >
                  <Image
                    source={{ uri: user.profilePicture }}
                    className="w-12 h-12 rounded-full border border-border-glass-medium"
                  />

                  <View className="ml-3 flex-1">
                    <Text className="text-text-primary font-bold text-base">
                      {user.firstName} {user.lastName}
                    </Text>

                    <Text className="text-text-tertiary">
                      @{user.username}
                    </Text>
                  </View>

                  <Feather
                    name="chevron-right"
                    size={18}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          <View className="p-4">
            <Text
              className="text-xl font-bold text-text-primary mb-4"
              style={{
                textShadowColor: "#0A84FF",
                textShadowRadius: 8,
              }}
            >
              Trending for you
            </Text>

            {TRENDING_TOPICS.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="py-4 border-b border-border-glass-light"
              >
                <Text className="font-bold text-text-primary text-lg">
                  {item.topic}
                </Text>

                <Text className="text-text-tertiary text-sm mt-1">
                  {item.tweets} Posts
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SearchScreen;