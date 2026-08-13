import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSearchUsers } from "@/hooks/useSearchUsers";
import { useDebounce } from "use-debounce";
import ScreenHeader from "@/components/ui/ScreenHeader";
import SearchBar from "@/components/ui/SearchBar";
import Avatar from "@/components/ui/Avatar";

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
    <SafeAreaView className="flex-1 bg-chat-bg" edges={["top"]}>
      {/* Screen Header & Search Input */}
      <ScreenHeader title="Explore" />
      
      <View className="px-4 py-3">
        <SearchBar
          placeholder="Search Circlee"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        className="flex-1 bg-chat-bg"
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
                <Text className="text-zinc-500 text-sm">
                  No users found
                </Text>
              </View>
            ) : (
              users.map((user: any) => (
                <TouchableOpacity
                  key={user._id}
                  onPress={() => router.push(`/${user.username}`)}
                  className="flex-row items-center py-3.5 border-b border-border-glass-light"
                  activeOpacity={0.7}
                >
                  <Avatar
                    uri={user.profilePicture}
                    size={48}
                    borderClassName="border border-border-glass-light"
                  />

                  <View className="ml-3 flex-1">
                    <Text className="text-white font-bold text-base">
                      {user.firstName} {user.lastName}
                    </Text>

                    <Text className="text-zinc-500 text-xs mt-0.5">
                      @{user.username}
                    </Text>
                  </View>

                  <Feather
                    name="chevron-right"
                    size={16}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          <View className="p-4">
            <Text className="text-base font-bold text-white mb-3">
              Trending for you
            </Text>

            {TRENDING_TOPICS.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="py-4 border-b border-border-glass-light"
                activeOpacity={0.7}
              >
                <Text className="font-bold text-white text-base">
                  {item.topic}
                </Text>

                <Text className="text-zinc-500 text-xs mt-1">
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