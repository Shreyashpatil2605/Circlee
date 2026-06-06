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
      <BlurView
        intensity={70}
        tint="dark"
        className="flex-row items-center justify-between px-4 py-4 border-b border-border-glass-light"
      >
        <Text
          className="text-xl font-bold text-text-primary"
          style={{ textShadowColor: "#0A84FF", textShadowRadius: 10 }}
        >
          Messages
        </Text>
        <TouchableOpacity>
          <Feather name="edit" size={24} color={"#0A84FF"} />
        </TouchableOpacity>
      </BlurView>

      {/* Search Bar */}
      <View className="px-4 py-3 border-b border-border-glass-light">
        <View className="flex-row items-center bg-glass-light rounded-full px-4 py-2.5 border border-border-glass-medium">
          <Feather name="search" size={20} color="#0A84FF" />
          <TextInput
            placeholder="Search conversations..."
            className="flex-1 ml-3 text-base text-text-primary"
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Conversations List */}
      {isLoadingConversations ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0A84FF" />
        </View>
      ) : filteredConversations.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Feather name="message-square" size={48} color="#6B7280" />
          <Text className="mt-4 text-text-tertiary">No conversations yet</Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item._id}
          renderItem={({ item: conversation }) => (
            <TouchableOpacity
              onPress={() => openConversation(conversation)}
              className="flex-row items-center px-4 py-4 border-b border-border-glass-light"
            >
              <Image
                source={{
                  uri: conversation.otherUser?.profilePicture,
                }}
                className="w-12 h-12 rounded-full mr-3 border border-accent-blue/30"
              />
              <View className="flex-1">
                <Text className="font-semibold text-text-primary">
                  {conversation.otherUser?.firstName}{" "}
                  {conversation.otherUser?.lastName}
                </Text>
                <Text className="text-text-tertiary text-sm" numberOfLines={1}>
                  {conversation.lastMessage}
                </Text>
              </View>
              <Text className="text-text-tertiary text-xs">
                {conversation.lastMessageAt
                  ? format(new Date(conversation.lastMessageAt), "p")
                  : ""}
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
            <BlurView
              intensity={70}
              tint="dark"
              className="flex-row items-center justify-between px-4 py-4 border-b border-border-glass-light"
            >
              <TouchableOpacity onPress={closeChatModal}>
                <Feather name="arrow-left" size={24} color="#0A84FF" />
              </TouchableOpacity>
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-text-primary">
                  {selectedConversation?.otherUser?.firstName}{" "}
                  {selectedConversation?.otherUser?.lastName}
                </Text>
                <Text className="text-text-tertiary text-sm">
                  @{selectedConversation?.otherUser?.username}
                </Text>
              </View>
            </BlurView>

            {/* Messages */}
            {isLoadingMessages ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#0A84FF" />
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
                        className={`max-w-xs px-4 py-3 rounded-xl ${isOwnMessage ? "bg-accent-blue" : "bg-glass-light"}`}
                        style={
                          isOwnMessage
                            ? {
                                shadowColor: "#0A84FF",
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.4,
                                shadowRadius: 8,
                              }
                            : {}
                        }
                      >
                        <Text
                          className={`text-base ${isOwnMessage ? "text-white" : "text-text-primary"}`}
                        >
                          {message.content}
                        </Text>
                        <Text
                          className={`text-xs mt-1 ${isOwnMessage ? "text-accent-blue-light" : "text-text-tertiary"}`}
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
            <View className="border-t border-border-glass-light p-4 bg-dark-secondary/50">
              <View className="flex-row items-end">
                <TextInput
                  className="flex-1 border border-border-glass-medium rounded-2xl px-4 py-3 mr-3 max-h-24 text-text-primary bg-glass-light"
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
                  className={`p-3 rounded-full ${messageText.trim() ? "bg-accent-blue" : "bg-glass-light"}`}
                  style={
                    messageText.trim()
                      ? {
                          shadowColor: "#0A84FF",
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.6,
                          shadowRadius: 10,
                        }
                      : {}
                  }
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Feather
                      name="send"
                      size={20}
                      color={messageText.trim() ? "#FFFFFF" : "#9CA3AF"}
                    />
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
