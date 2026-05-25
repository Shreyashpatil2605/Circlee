import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useConversations, useMessages } from "@/hooks/useMessages";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { format } from "date-fns";

const MessageScreen = () => {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { currentUser } = useCurrentUser();

  const {
    conversations,
    isLoading: isLoadingConversations,
    refetch,
  } = useConversations();

  const {
    messages,
    isLoadingMessages,
    messageText,
    setMessageText,
    sendMessage,
    isSending,
  } = useMessages(selectedConversation?._id || "");

  const openConversation = (conversation: any) => {
    setSelectedConversation(conversation);
    setIsChatOpen(true);
  };

  const closeChatModal = () => {
    setIsChatOpen(false);
    setSelectedConversation(null);
    setMessageText("");
  };

  const filteredConversations = conversations.filter(
    (conv: any) =>
      conv.otherUser?.firstName
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      conv.otherUser?.username.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={["top"]}>
      {/* HEADER */}
      <BlurView intensity={20} tint="light" className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-black" style={{ textShadowColor: '#9D00FF', textShadowRadius: 10 }}>Messages</Text>
        <TouchableOpacity>
          <Feather name="edit" size={24} color={"#9D00FF"} />
        </TouchableOpacity>
      </BlurView>

      {/* Search Bar */}
      <View className="px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2.5 border border-gray-300">
          <Feather name="search" size={20} color="#9D00FF" />
          <TextInput
            placeholder="Search conversations..."
            className="flex-1 ml-3 text-base text-black"
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Conversations List */}
      {isLoadingConversations ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9D00FF" />
        </View>
      ) : filteredConversations.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Feather name="message-square" size={48} color="#999" />
          <Text className="mt-4 text-gray-600">No conversations yet</Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item._id}
          renderItem={({ item: conversation }) => (
            <TouchableOpacity
              onPress={() => openConversation(conversation)}
              className="flex-row items-center px-4 py-4 border-b border-gray-200"
            >
              <Image
                source={{
                  uri: conversation.otherUser?.profilePicture,
                }}
                className="w-12 h-12 rounded-full mr-3 border border-neon-purple/50"
              />
              <View className="flex-1">
                <Text className="font-semibold text-black">
                  {conversation.otherUser?.firstName}{" "}
                  {conversation.otherUser?.lastName}
                </Text>
                <Text className="text-gray-600 text-sm" numberOfLines={1}>
                  {conversation.lastMessage}
                </Text>
              </View>
              <Text className="text-gray-600 text-xs">
                {conversation.lastMessageAt ? format(new Date(conversation.lastMessageAt), "p") : ""}
              </Text>
            </TouchableOpacity>
          )}
          scrollEnabled
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Chat Modal */}
      <Modal
        visible={isChatOpen}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <SafeAreaView className="flex-1 bg-dark-bg">
            {/* Chat Header */}
            <BlurView intensity={20} tint="light" className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
              <TouchableOpacity onPress={closeChatModal}>
                <Feather name="arrow-left" size={24} color="#9D00FF" />
              </TouchableOpacity>
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-black">
                  {selectedConversation?.otherUser?.firstName}{" "}
                  {selectedConversation?.otherUser?.lastName}
                </Text>
                <Text className="text-gray-600 text-sm">
                  @{selectedConversation?.otherUser?.username}
                </Text>
              </View>
            </BlurView>

            {/* Messages */}
            {isLoadingMessages ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#9D00FF" />
              </View>
            ) : (
              <FlatList
                data={messages}
                keyExtractor={(item) => item._id}
                renderItem={({ item: message }) => {
                  const isOwnMessage = message.sender?.id === currentUser?._id;
                  return (
                    <View
                      className={`px-4 py-2 flex-row ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <View
                        className={`max-w-xs px-4 py-3 rounded-2xl ${isOwnMessage ? "bg-neon-purple" : "bg-gray-200"}`}
                        style={isOwnMessage ? { shadowColor: '#9D00FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8 } : {}}
                      >
                        <Text
                          className={`text-base ${isOwnMessage ? "text-white" : "text-black"}`}
                        >
                          {message.content}
                        </Text>
                        <Text
                          className={`text-xs mt-1 ${isOwnMessage ? "text-purple-200" : "text-gray-500"}`}
                        >
                          {format(new Date(message.createdAt), "p")}
                        </Text>
                      </View>
                    </View>
                  );
                }}
                scrollEnabled
                inverted
              />
            )}

            {/* Message Input */}
            <View className="border-t border-gray-200 p-4">
              <View className="flex-row items-end">
                <TextInput
                  className="flex-1 border border-gray-300 rounded-full px-4 py-3 mr-3 max-h-24 text-black bg-gray-50"
                  placeholder="Type a message..."
                  placeholderTextColor="#9CA3AF"
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  onPress={sendMessage}
                  disabled={isSending || !messageText.trim()}
                  className={`p-3 rounded-full ${messageText.trim() ? "bg-neon-purple" : "bg-gray-200"}`}
                  style={messageText.trim() ? { shadowColor: '#9D00FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 10 } : {}}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Feather name="send" size={20} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default MessageScreen;
