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
import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useConversations, useMessages } from "@/hooks/useMessages";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { format, formatDistanceToNow } from "date-fns";
import { useApiClient, userApi } from "@/utils/api";

const MessageScreen = () => {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { currentUser } = useCurrentUser();
  const api = useApiClient();

  const {
    conversations,
    isLoading: isLoadingConversations,
    markConversationRead,
    refetch,
  } = useConversations();
  console.log("Conversations:", conversations);
  console.log("CONVERSATIONS:", JSON.stringify(conversations, null, 2));

  const {
    messages,
    isLoadingMessages,
    messageText,
    setMessageText,
    sendMessage,
    isSending,
  } = useMessages(selectedConversation?._id || "");

  const openConversation = async (conversation: any) => {
    try {
      await markConversationRead({
        conversationId: conversation._id,
      });

      setSelectedConversation(conversation);

      const response = await userApi.getUserProfile(
        api,
        conversation.otherUser.username,
      );

      setSelectedUserProfile(response.data.user);

      setIsChatOpen(true);
    } catch (error) {
      console.log("PROFILE FETCH ERROR:", error);

      setSelectedConversation(conversation);
      setIsChatOpen(true);
    }
  };

  const closeChatModal = () => {
    setIsChatOpen(false);
    setSelectedConversation(null);
    setSelectedUserProfile(null);
    setMessageText("");
  };

  const filteredConversations = conversations.filter(
    (conv: any) =>
      conv.otherUser?.firstName
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      conv.otherUser?.username.toLowerCase().includes(searchText.toLowerCase()),
  );
  const flatListRef = useRef<FlatList>(null);
  useEffect(() => {
    flatListRef.current?.scrollToEnd({
      animated: true,
    });
  }, [messages]);

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
          contentContainerStyle={{
            paddingVertical: 10,
            paddingBottom: 20,
          }}
          renderItem={({ item: conversation }) => (
            <TouchableOpacity
              onPress={() => openConversation(conversation)}
              className="flex-row items-center px-4 py-3"
            >
              <View className="relative mr-3">
                <Image
                  source={{
                    uri: conversation.otherUser?.profilePicture,
                  }}
                  className="w-12 h-12 rounded-full border border-accent-blue/30"
                />

                {conversation.otherUser?.isOnline && (
                  <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                )}
              </View>
              <View className="flex-1 flex-row justify-between">
                {/* Left Side */}
                <View className="flex-1 mr-3">
                  <Text className="font-semibold text-text-primary text-base">
                    {conversation.otherUser?.firstName}{" "}
                    {conversation.otherUser?.lastName}
                  </Text>
                  <Text
                    className={`mt-1 text-sm ${
                      conversation.unreadCount > 0
                        ? "text-white font-semibold"
                        : "text-text-tertiary"
                    }`}
                    numberOfLines={1}
                  >
                    {conversation.lastMessage}
                  </Text>
                </View>

                {/* Right Side */}
                <View className="items-end justify-between">
                  <Text
                    className={`text-xs ${
                      conversation.unreadCount > 0
                        ? "text-green-500 font-semibold"
                        : "text-text-tertiary"
                    }`}
                  >
                    {conversation.lastMessageAt
                      ? format(new Date(conversation.lastMessageAt), "p")
                      : ""}
                  </Text>

                  {conversation.unreadCount > 0 && (
                    <View className="bg-green-500 min-w-6 h-6 rounded-full items-center justify-center mt-2 px-2">
                      <Text className="text-white text-[10px] font-bold">
                        {conversation.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          scrollEnabled
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
          <SafeAreaView className="flex-1 bg-zinc-950">
            {/* Chat Header */}

            <BlurView
              intensity={70}
              tint="dark"
              className="flex-row items-center justify-between px-4 py-4 border-b border-border-glass-light"
            >
              <TouchableOpacity onPress={closeChatModal}>
                <Feather name="arrow-left" size={24} color="#0A84FF" />
              </TouchableOpacity>
              <Image
                source={{
                  uri: selectedConversation?.otherUser?.profilePicture,
                }}
                className="w-10 h-10 rounded-full ml-3 mr-3"
              />
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-text-primary">
                  {selectedConversation?.otherUser?.firstName}{" "}
                  {selectedConversation?.otherUser?.lastName}
                </Text>
                {selectedUserProfile?.isOnline ? (
                  <Text className="text-green-500 text-sm">● Online</Text>
                ) : (
                  <Text className="text-text-tertiary text-sm">
                    Last seen{" "}
                    {selectedUserProfile?.lastSeen
                      ? formatDistanceToNow(
                          new Date(selectedUserProfile.lastSeen),
                          { addSuffix: true },
                        )
                      : "recently"}
                  </Text>
                )}
              </View>
            </BlurView>

            {/* Messages */}
            {isLoadingMessages ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#0A84FF" />
              </View>
            ) : messages.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Feather name="message-circle" size={48} color="#6B7280" />

                <Text className="mt-4 text-text-primary font-semibold">
                  No messages yet
                </Text>

                <Text className="mt-1 text-text-tertiary">
                  Start the conversation 👋
                </Text>
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{
                  paddingVertical: 10,
                  paddingBottom: 20,
                }}
                renderItem={({ item: message }) => {
                  const isOwnMessage =
                    message.sender?.clerkId === currentUser?.clerkId;

                  return (
                    <View
                      className={`px-3 mb-2 ${
                        isOwnMessage ? "items-end" : "items-start"
                      }`}
                    >
                      <View
                        className={`
                                    max-w-[85%]
                                    px-4
                                    py-3
                                    rounded-3xl
                                    ${
                                      isOwnMessage
                                        ? "bg-accent-blue rounded-br-md"
                                        : "bg-zinc-900 rounded-bl-md"
                                    }
                                  `}
                      >
                        <Text
                          className={`text-base ${
                            isOwnMessage ? "text-white" : "text-white"
                          }`}
                        >
                          {message.content}
                        </Text>

                        <Text
                          className={`text-[11px] mt-1 self-end ${
                            isOwnMessage ? "text-blue-200" : "text-zinc-400"
                          }`}
                        >
                          {format(new Date(message.createdAt), "p")}
                        </Text>
                      </View>
                    </View>
                  );
                }}
                scrollEnabled
              />
            )}

            {/* Message Input */}
            <View className="border-t border-border-glass-light p-4 bg-dark-secondary/50">
              <View className="flex-row items-end">
                <TextInput
                  className="flex-1 bg-zinc-900 rounded-full px-5 py-3 mr-3 text-white max-h-24"
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
