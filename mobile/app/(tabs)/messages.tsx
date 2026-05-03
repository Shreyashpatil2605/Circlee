import {
  View,
  Text,
  Alert,
  Touchable,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import React, { useState } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { CONVERSATIONS, ConversationType } from "@/data/conversations";
import { Feather } from "@expo/vector-icons";

const MessageScreen = () => {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [conversationList, setConversationList] = useState(CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState<ConversationType | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newMeassage, setNewMessage] = useState("");

  const deleteConversation = (conversationId: number) => {
    Alert.alert(
      "Delete Conversation",
      "Are you sure you want to delete the conversation ?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Conversation",
          style: "destructive",
          onPress: () => {
            setConversationList((prev) =>
              prev.filter((conv) => conv.id !== conversationId),
            );
          },
        },
      ],
    );
  };

 const openCoversation = (conversation: ConversationType) => {
    setSelectedConversation(conversation);
    setIsChatOpen(true);
  };

  const closeChatModal = () => {
    setIsChatOpen(false);
    setSelectedConversation(null);
    setNewMessage("");
  };
  
  const sendMessage = () => {
    if (newMeassage.trim() && selectedConversation) {
      setConversationList((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? { ...conv, lastMessage: newMeassage }
            : conv,
        ),
      );
      setNewMessage("");
      Alert.alert(
        `Message sent!","Your message has been sent to ${selectedConversation.user.name}`,
      );
    }
  };

  return (
    <SafeAreaView className=" flex-1 bg-white" edges={["top"]}>
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900"> Messages </Text>
        <TouchableOpacity>
          <Feather name="edit" size={24} color={"#1DA1F2"} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2.5">
          <Feather name="search" size={20} color="#657786" />
          <TextInput
            placeholder="Search for the people and the groups...."
            className="flex-1 ml-3 text-base"
            placeholderTextColor="#65778"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>
      {/* Coversation List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
        {conversationList.map((conversation) => (
          <TouchableOpacity
            key={conversation.id}
            className="flex-row items-center p-4 border-b border-gray-300 active:bg-gray-50"
            onPress={() => openCoversation(conversation)}
            onLongPress={() => deleteConversation(conversation.id)}
          >
            <Image
              source={{ uri: conversation.user.avatar }}
              className="size-12 rounded-full mr-3"
            />
            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center gap-2">
                  <Text className="font-semibold ">
                    {" "}
                    {conversation.user.name}
                  </Text>
                  {conversation.user.verified && (
                    <Feather
                      name="check-circle"
                      size={16}
                      color="#1DA1F2"
                    ></Feather>
                  )}
                  <Text className="text-gray-500 text-sm ml-1">
                    @{conversation.user.username}
                  </Text>
                </View>
                <Text className="text-gray-500 text-sm">
                  {" "}
                  {conversation.time}
                </Text>
              </View>
              <Text className="text-sm text-gray-500 " numberOfLines={2}>
                {conversation.lastMessage}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Quick Actions */}
      <View className="px-4 py-2 border-t border-gray-100 bg-gray-50">
        <Text className="text-xs text-gray-500 text-center">
          Tap to open * Long press to delete
        </Text>
      </View>
      <Modal
        visible={isChatOpen}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedConversation && (
          <SafeAreaView className="flex-1">
            {/* Chat header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
              <TouchableOpacity onPress={closeChatModal} className="mr-3">
                <Feather name="arrow-left" size={24} color={"#1DA1F2"} />
              </TouchableOpacity>
              <Image
                source={{ uri: selectedConversation.user.avatar }}
                className="size-10 rounded-full mr-3"
              />
              <View className="flex-1 ">
                <View className="flex-row items-center gap-1">
                  <Text className="font-semibold text-gray-900 mr-1 ">
                    {selectedConversation.user.name}
                  </Text>
                  {selectedConversation.user.verified && (
                    <Feather name="check-circle" size={16} color="#1DA1F2" />
                  )}
                </View>
                <Text className="text-gray-500 text-sm">
                  @{selectedConversation.user.username}
                </Text>
              </View>
            </View>
            {/* chat messages area */}
            <ScrollView
              className="flex-1 px-4 py-4"
              showsVerticalScrollIndicator={false}
            >
              <View className="mb-4">
                <Text className="text-center text-gray-400 text-sm mb-4">
                  This is the beginning of the conversation with{" "}
                  {selectedConversation.user.name}
                </Text>

                {/* Conversation Messages */}
                {selectedConversation.messages.map((message) => (
                  <View
                    key={message.id}
                    className={`flex-row mb-3 ${message.fromUser ? "justify-end" : ""}`}
                  >
                    {!message.fromUser && (
                      <Image
                        source={{ uri: selectedConversation.user.avatar }}
                        className="size-8 rounded-full mr-2"
                      />
                    )}
                    <View
                      className={`flex-1 ${message.fromUser ? "items-end" : ""}`}
                    >
                      <View
                        className={`rounded-2xl px-4 py-5 max-w-xl ${message.fromUser ? "bg-blue-400" : "bg-gray-100"}`}
                      >
                        <Text
                          className={
                            message.fromUser ? "text-white" : "text-gray-700"
                          }
                        >
                          {message.text}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-500 ml-1">
                        {message.time}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Message Input */}
            <View className="flex-row items-center px-4 py-3 border-t border-gray-100">
              <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-3 mr-3">
                <TextInput
                  className="flex-1 text-base"
                  placeholder="Start a message..."
                  placeholderTextColor="#657786"
                  value={newMeassage}
                  onChangeText={setNewMessage}
                  multiline
                />
              </View>
              <TouchableOpacity
                onPress={sendMessage}
                className={`size-10 rounded-full items-center justify-center ${
                  newMeassage.trim() ? "bg-blue-500" : "bg-gray-300"
                }`}
                disabled={!newMeassage.trim()}
              >
                <Feather name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default MessageScreen;
