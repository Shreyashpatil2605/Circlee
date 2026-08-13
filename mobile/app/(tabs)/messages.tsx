import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import * as Clipboard from "expo-clipboard";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useConversations, useMessages } from "@/hooks/useMessages";
import { useNotifications } from "@/hooks/useNotifications";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { useApiClient, userApi } from "@/utils/api";
import { LinearGradient } from "expo-linear-gradient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import Animated, { SlideInDown } from "react-native-reanimated";
import { useLocalSearchParams, router } from "expo-router";

// Design System Imports
import AnimatedBackground from "@/components/chat/AnimatedBackground";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import MessageBubble from "@/components/chat/MessageBubble";
import DateSeparator from "@/components/chat/DateSeparator";

// Interactive Overlays & Sheets
import { MessageActionSheet } from "@/components/chat/MessageActionSheet";
import TypingIndicator from "@/components/chat/TypingIndicator";
import AttachmentSheet from "@/components/chat/AttachmentSheet";
import ProfileDrawer from "@/components/chat/ProfileDrawer";
import PinnedMessage from "@/components/chat/PinnedMessage";

const MessageScreen = () => {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Interactive States
  const [isReactionPopupVisible, setIsReactionPopupVisible] = useState(false);
  const [activeMessageForReaction, setActiveMessageForReaction] = useState<any>(null);
  const [isAttachmentSheetVisible, setIsAttachmentSheetVisible] = useState(false);
  const [isProfileDrawerVisible, setIsProfileDrawerVisible] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState<any>(null);
  const [reactionsMap, setReactionsMap] = useState<Record<string, string[]>>({});

  // Phase 3 Search & Pinned States
  const [isSearchingInChat, setIsSearchingInChat] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [pinnedMessage, setPinnedMessage] = useState<string | null>(
    "Welcome to the Circleee premium experience! Let's get started. 🚀"
  );

  const { currentUser } = useCurrentUser();
  const api = useApiClient();
  const { markConversationMessagesRead } = useNotifications();

  const {
    conversations,
    isLoading: isLoadingConversations,
    markConversationRead,
    getOrCreateConversation,
    deleteConversation,
  } = useConversations();

  const params = useLocalSearchParams();
  const senderClerkId = params.senderClerkId as string | undefined;

  useEffect(() => {
    const checkAndOpenConversation = async () => {
      if (senderClerkId && conversations.length > 0) {
        let conv = conversations.find((c: any) =>
          c.participants.includes(senderClerkId)
        );

        if (!conv) {
          await getOrCreateConversation({
            participantId: senderClerkId,
          });
          return;
        }

        openConversation(conv);
        router.setParams({ senderClerkId: undefined });
      }
    };

    checkAndOpenConversation();
  }, [senderClerkId, conversations]);

  const {
    messages,
    isLoadingMessages,
    messageText,
    setMessageText,
    sendMessage,
    isSending,
    updateTyping,
    conversation,
    deleteMessage,
  } = useMessages(selectedConversation?._id || "");

  useEffect(() => {
    if (isChatOpen && selectedConversation?._id && messages.length > 0) {
      markConversationMessagesRead(selectedConversation._id);
    }
  }, [messages.length, isChatOpen, selectedConversation]);

  const openConversation = async (conversation: any) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await markConversationRead({
        conversationId: conversation._id,
      });

      markConversationMessagesRead(conversation._id);

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsChatOpen(false);
    setSelectedConversation(null);
    setSelectedUserProfile(null);
    setMessageText("");
    setReplyingToMessage(null);
    setIsSearchingInChat(false);
    setChatSearchQuery("");
    prevConversationRef.current = null;
  };

  const handleHeaderMorePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Chat Options",
      undefined,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Search Messages",
          onPress: () => setIsSearchingInChat(!isSearchingInChat),
        },
        {
          text: "Mute Notifications",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Muted", "Notifications muted for this conversation.");
          },
        },
        {
          text: "Delete Chat",
          style: "destructive",
          onPress: handleDeleteChatConfirm,
        },
      ]
    );
  };

  const handleDeleteChatConfirm = () => {
    Alert.alert(
      "Delete chat?",
      "This conversation will be removed from your chat list. Your chat history will remain available to the other participant.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: executeDeleteChat,
        },
      ]
    );
  };

  const executeDeleteChat = async () => {
    if (!selectedConversation?._id) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      const res = await deleteConversation(selectedConversation._id);
      if (res?.success) {
        closeChatModal();
        setSelectedConversation(null);
        setReplyingToMessage(null);
        setActiveMessageForReaction(null);
        setIsReactionPopupVisible(false);
        // Reset scroll refs
        hasScrolledInitially.current = false;
        isAtBottom.current = true;
        prevMessagesLengthRef.current = 0;
        latestMessageIdRef.current = null;
      } else {
        throw new Error("Mutation did not return success");
      }
    } catch (err) {
      console.error("Delete conversation error:", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Couldn't delete chat", "Please try again.");
    }
  };

  useEffect(() => {
    // If the conversation was previously active/open and now it transitioned to null,
    // it means it was deleted.
    if (isChatOpen && conversation === null && prevConversationRef.current !== null) {
      closeChatModal();
      // Reset scroll refs
      hasScrolledInitially.current = false;
      isAtBottom.current = true;
      prevMessagesLengthRef.current = 0;
      latestMessageIdRef.current = null;
    }
    prevConversationRef.current = conversation;
  }, [conversation, isChatOpen]);

  const getMessageDateLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  const filteredConversations = conversations.filter(
    (conv: any) =>
      conv.otherUser?.firstName
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      conv.otherUser?.username.toLowerCase().includes(searchText.toLowerCase()),
  );

  const isTyping =
    conversation?.typingBy === selectedConversation?.otherUser?.clerkId;
  
  const flatListRef = useRef<FlatList>(null);
  const hasScrolledInitially = useRef(false);
  const isAtBottom = useRef(true);
  const prevMessagesLengthRef = useRef(0);
  const latestMessageIdRef = useRef<string | null>(null);
  const initialScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevConversationRef = useRef<any>(null);

  const scrollToBottom = (animated = false) => {
    if (!flatListRef.current || !messages || messages.length === 0) return;
    const firstMsg = messages[0];
    const lastMsg = messages[messages.length - 1];
    console.log(`[CHAT SCROLL] conversationId: ${selectedConversation?._id}`);
    console.log(`[CHAT SCROLL] message count: ${messages.length}`);
    console.log(`[CHAT SCROLL] first message: ${firstMsg ? `${firstMsg.sender?.firstName || "Unknown"}: ${firstMsg.content?.substring(0, 20)}` : "none"}`);
    console.log(`[CHAT SCROLL] last message: ${lastMsg ? `${lastMsg.sender?.firstName || "Unknown"}: ${lastMsg.content?.substring(0, 20)}` : "none"}`);
    console.log(`[CHAT SCROLL] scrolling to latest`);
    flatListRef.current.scrollToEnd({ animated });
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    isAtBottom.current = distanceFromBottom < 100;
  };

  const handleContentSizeChange = () => {
    if (!hasScrolledInitially.current && messages && messages.length > 0) {
      scrollToBottom(false);
      if (initialScrollTimeoutRef.current) {
        clearTimeout(initialScrollTimeoutRef.current);
      }
      initialScrollTimeoutRef.current = setTimeout(() => {
        scrollToBottom(false);
        hasScrolledInitially.current = true;
      }, 100);
    }
  };

  useEffect(() => {
    if (selectedConversation?._id) {
      hasScrolledInitially.current = false;
      isAtBottom.current = true;
      prevMessagesLengthRef.current = 0;
      latestMessageIdRef.current = null;
      if (initialScrollTimeoutRef.current) {
        clearTimeout(initialScrollTimeoutRef.current);
        initialScrollTimeoutRef.current = null;
      }
    }
  }, [selectedConversation?._id]);

  useEffect(() => {
    if (!messages || messages.length === 0) {
      prevMessagesLengthRef.current = 0;
      latestMessageIdRef.current = null;
      return;
    }

    const latestMessage = messages[messages.length - 1];
    const isOwnMessage = latestMessage?.sender?.clerkId === currentUser?.clerkId;

    if (latestMessage && latestMessage._id !== latestMessageIdRef.current) {
      if (hasScrolledInitially.current) {
        if (isAtBottom.current || isOwnMessage) {
          requestAnimationFrame(() => {
            scrollToBottom(true);
          });
        }
      }
      latestMessageIdRef.current = latestMessage._id;
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, currentUser]);

  const prevIsTypingRef = useRef(isTyping);
  useEffect(() => {
    if (isTyping && !prevIsTypingRef.current && hasScrolledInitially.current && isAtBottom.current) {
      requestAnimationFrame(() => {
        scrollToBottom(true);
      });
    }
    prevIsTypingRef.current = isTyping;
  }, [isTyping]);

  useEffect(() => {
    return () => {
      if (initialScrollTimeoutRef.current) {
        clearTimeout(initialScrollTimeoutRef.current);
      }
    };
  }, []);

  const isRecentlyActive =
    selectedUserProfile?.lastSeen &&
    Date.now() - new Date(selectedUserProfile.lastSeen).getTime() < 60000;

  const lastSeenText = isRecentlyActive
    ? "Active Now"
    : selectedUserProfile?.lastSeen
    ? `Last seen ${formatDistanceToNow(new Date(selectedUserProfile.lastSeen), {
        addSuffix: true,
      })}`
    : "Offline";

  const handleLongPressBubble = (message: any) => {
    setActiveMessageForReaction(message);
    setIsReactionPopupVisible(true);
  };

  const handleSelectReaction = (emoji: string) => {
    if (!activeMessageForReaction) return;
    const msgId = activeMessageForReaction._id;
    setReactionsMap((prev) => ({
      ...prev,
      [msgId]: [emoji],
    }));
  };

  const handleReplyMessage = () => {
    if (!activeMessageForReaction) return;
    setReplyingToMessage(activeMessageForReaction);
  };

  const handleCopyMessage = async () => {
    if (!activeMessageForReaction) return;
    await Clipboard.setStringAsync(activeMessageForReaction.content);
  };

  const handleDeleteMessage = () => {
    if (!activeMessageForReaction) return;

    const isOwnMessage = activeMessageForReaction.senderId === currentUser?.clerkId;

    if (isOwnMessage) {
      Alert.alert(
        "Delete message?",
        undefined,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete for me",
            onPress: async () => {
              try {
                await deleteMessage(activeMessageForReaction._id, "me");
              } catch (err) {
                console.error("Delete for me error:", err);
              }
            },
          },
          {
            text: "Delete for everyone",
            style: "destructive",
            onPress: () => {
              Alert.alert(
                "Delete for everyone?",
                "This message will be removed for everyone in this conversation.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        await deleteMessage(activeMessageForReaction._id, "everyone");
                      } catch (err) {
                        console.error("Delete for everyone error:", err);
                      }
                    },
                  },
                ]
              );
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Delete message?",
        "Delete this message for you?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete for me",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteMessage(activeMessageForReaction._id, "me");
              } catch (err) {
                console.error("Delete for me error:", err);
              }
            },
          },
        ]
      );
    }
  };

  const handleSwipeToReply = (message: any) => {
    setReplyingToMessage(message);
  };

  const handleSendMessage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sendMessage();
    if (replyingToMessage) {
      setReplyingToMessage(null);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-chat-bg" edges={["top"]}>
        {/* Premium Animated Background */}
        <AnimatedBackground />

        {/* HEADER */}
        <View className="border-b border-chat-divider overflow-hidden">
          <BlurView
            intensity={80}
            tint="dark"
            style={{ backgroundColor: "rgba(11, 11, 18, 0.4)" }}
          >
            <View className="flex-row items-center justify-between px-4 py-4">
              <Text className="text-xl font-bold text-chat-text-primary">
                Messages
              </Text>
              <TouchableOpacity
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                activeOpacity={0.7}
                className="p-2 rounded-full bg-chat-secondary/40"
              >
                <Feather name="edit-3" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>

        {/* Search Bar */}
        <View className="px-4 py-3 border-b border-chat-divider">
          <View className="flex-row items-center bg-chat-secondary/60 rounded-full px-4 py-2 border border-chat-divider">
            <Feather name="search" size={18} color="#A7A7B5" />
            <TextInput
              placeholder="Search conversations..."
              className="flex-1 ml-3 text-base text-chat-text-primary"
              placeholderTextColor="#A7A7B5"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Conversations List */}
        {isLoadingConversations ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#6B4EFF" />
          </View>
        ) : filteredConversations.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Feather name="message-square" size={48} color="#A7A7B5" />
            <Text className="mt-4 text-chat-text-secondary text-base text-center">
              No conversations yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredConversations}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{
              paddingVertical: 10,
              paddingBottom: 40,
            }}
            renderItem={({ item: conv, index }) => {
              const hasUnread = conv.unreadCount > 0;
              const isPinned = index === 0;
              const isMuted = index === 1;

              return (
                <TouchableOpacity
                  onPress={() => openConversation(conv)}
                  activeOpacity={0.8}
                  className="flex-row items-center mx-4 my-1.5 p-3.5 bg-chat-card/45 border border-chat-divider rounded-2xl"
                >
                  {/* Avatar with gradient border if unread */}
                  <View className="relative mr-4">
                    {hasUnread ? (
                      <LinearGradient
                        colors={["#6B4EFF", "#8D6CFF"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="p-[2px] rounded-full"
                      >
                        <Image
                          source={{ uri: conv.otherUser?.profilePicture }}
                          className="w-12 h-12 rounded-full border-2 border-chat-bg"
                        />
                      </LinearGradient>
                    ) : (
                      <Image
                        source={{ uri: conv.otherUser?.profilePicture }}
                        className="w-12 h-12 rounded-full border border-chat-divider"
                      />
                    )}

                    {conv.otherUser?.isOnline && (
                      <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-chat-green rounded-full border-[3px] border-chat-bg" />
                    )}
                  </View>

                  {/* Info block */}
                  <View className="flex-1 justify-center">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1 mr-2">
                        <Text className="font-semibold text-chat-text-primary text-[15px]" numberOfLines={1}>
                          {conv.otherUser?.firstName} {conv.otherUser?.lastName}
                        </Text>
                        {/* Verified Badge Mock */}
                        <View className="ml-1 bg-chat-purple/20 p-0.5 rounded-full">
                          <Feather name="check" size={8} color="#8D6CFF" />
                        </View>
                        {isMuted && (
                          <Feather name="volume-x" size={12} color="#A7A7B5" className="ml-1.5" />
                        )}
                      </View>
                      <Text className="text-xs text-chat-text-secondary">
                        {conv.lastMessageAt
                          ? format(new Date(conv.lastMessageAt), "p")
                          : ""}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-1">
                      <Text
                        className={`text-sm flex-1 mr-2 ${
                          hasUnread ? "text-chat-text-primary font-medium" : "text-chat-text-secondary"
                        }`}
                        numberOfLines={1}
                      >
                        {conv.lastMessage}
                      </Text>

                      <View className="flex-row items-center gap-1.5">
                        {isPinned && (
                          <MaterialCommunityIcons name="pin" size={12} color="#8D6CFF" />
                        )}
                        {hasUnread && (
                          <View className="bg-chat-purple min-w-[18] h-[18] rounded-full items-center justify-center px-1">
                            <Text className="text-white text-[9px] font-bold">
                              {conv.unreadCount}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            scrollEnabled
          />
        )}

        {/* Chat Modal */}
        <Modal
          visible={isChatOpen}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? -15 : 0}
              className="flex-1 bg-chat-bg"
            >
            <View className="flex-1 relative">
              {/* Animated Background */}
              <AnimatedBackground />

              {/* Custom Chat Header */}
              <ChatHeader
                onBackPress={closeChatModal}
                onProfilePress={() => setIsProfileDrawerVisible(true)}
                onSearchPress={() => setIsSearchingInChat(!isSearchingInChat)}
                onMorePress={handleHeaderMorePress}
                otherUser={selectedConversation?.otherUser}
                isTyping={isTyping}
                lastSeenText={lastSeenText}
              />

              {/* Chat Search Sub-bar */}
              {isSearchingInChat && (
                <Animated.View
                  entering={SlideInDown.duration(200)}
                  className="absolute top-[82] left-0 right-0 z-40 bg-chat-secondary border-b border-chat-divider px-4 py-2.5 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center flex-1 bg-chat-bg border border-chat-divider rounded-full px-3 py-1 mr-3">
                    <Feather name="search" size={14} color="#A7A7B5" />
                    <TextInput
                      placeholder="Search in chat..."
                      placeholderTextColor="#A7A7B5"
                      className="flex-1 ml-2 text-xs text-chat-text-primary py-0.5"
                      value={chatSearchQuery}
                      onChangeText={setChatSearchQuery}
                      autoFocus
                    />
                    {chatSearchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setChatSearchQuery("")}>
                        <Feather name="x" size={14} color="#A7A7B5" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsSearchingInChat(false);
                      setChatSearchQuery("");
                    }}
                  >
                    <Text className="text-chat-purple-light text-xs font-semibold">Cancel</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* Pinned Message Banner */}
              {pinnedMessage && !isSearchingInChat && (
                <PinnedMessage
                  content={pinnedMessage}
                  onDismiss={() => setPinnedMessage(null)}
                  onPress={() => {
                    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                  }}
                />
              )}

              {/* Message Stream */}
              {isLoadingMessages ? (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator size="large" color="#6B4EFF" />
                </View>
              ) : messages.length === 0 ? (
                <View className="flex-1 items-center justify-center px-6">
                  <Feather name="message-circle" size={48} color="#A7A7B5" />
                  <Text className="mt-4 text-chat-text-primary text-base font-bold">
                    No messages yet
                  </Text>
                  <Text className="mt-1 text-chat-text-secondary text-sm text-center">
                    Start the conversation 👋
                  </Text>
                </View>
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={{
                    paddingTop: pinnedMessage && !isSearchingInChat ? 145 : isSearchingInChat ? 145 : 100, // Dynamic padding depending on active banners
                    paddingBottom: replyingToMessage ? 170 : 110,
                    paddingVertical: 10,
                  }}
                  onContentSizeChange={handleContentSizeChange}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  renderItem={({ item: message, index }) => {
                    const previousMessage = index > 0 ? messages[index - 1] : null;
                    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
                    
                    const showDateSeparator =
                      !previousMessage ||
                      getMessageDateLabel(previousMessage.createdAt) !==
                        getMessageDateLabel(message.createdAt);
                    
                    const isOwnMessage =
                      message.sender?.clerkId === currentUser?.clerkId;
                    const activeReactions = reactionsMap[message._id] || [];

                    // Telegram Grouping Calculations (sender check & within 2 minutes)
                    const isGroupedWithPrevious = !!(
                      previousMessage &&
                      previousMessage.senderId === message.senderId &&
                      message.createdAt - previousMessage.createdAt < 120000
                    );

                    const isGroupedWithNext = !!(
                      nextMessage &&
                      nextMessage.senderId === message.senderId &&
                      nextMessage.createdAt - message.createdAt < 120000
                    );

                    return (
                      <View key={message._id}>
                        {showDateSeparator && (
                          <DateSeparator label={getMessageDateLabel(message.createdAt)} />
                        )}
                        <MessageBubble
                          message={message}
                          isOwnMessage={isOwnMessage}
                          onLongPress={() => handleLongPressBubble(message)}
                          onSwipe={handleSwipeToReply}
                          reactions={activeReactions}
                          isGroupedWithPrevious={isGroupedWithPrevious}
                          isGroupedWithNext={isGroupedWithNext}
                          searchQuery={chatSearchQuery}
                        />
                      </View>
                    );
                  }}
                  ListFooterComponent={isTyping ? <TypingIndicator /> : null}
                  scrollEnabled
                />
              )}

              {/* Reply Preview Banner */}
              {replyingToMessage && (
                <View className="absolute bottom-[68] left-4 right-4 bg-chat-card/90 border border-chat-divider rounded-t-2xl px-4 py-2.5 flex-row items-center justify-between z-40">
                  <View className="flex-row items-center flex-1 mr-2">
                    <View className="w-1 h-8 bg-chat-purple rounded-full mr-3" />
                    <View className="flex-1">
                      <Text className="text-chat-purple-light text-xs font-semibold">
                        Replying to {replyingToMessage.sender?.firstName || "User"}
                      </Text>
                      <Text className="text-chat-text-secondary text-xs" numberOfLines={1}>
                        {replyingToMessage.content}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setReplyingToMessage(null);
                    }}
                    className="p-1 rounded-full bg-chat-secondary/60"
                  >
                    <Feather name="x" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Custom Chat Input */}
              <ChatInput
                value={messageText}
                onChangeText={(text) => {
                  setMessageText(text);
                  if (selectedConversation?._id) {
                    updateTyping({
                      conversationId: selectedConversation._id,
                      isTyping: text.length > 0,
                    });
                  }
                }}
                onSend={handleSendMessage}
                onAttachmentPress={() => setIsAttachmentSheetVisible(true)}
                onSendVoice={async (attachments) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  await sendMessage("", "voice", undefined, attachments);
                }}
                onEmojiPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                isSending={isSending}
              />
            </View>
            </KeyboardAvoidingView>
          </GestureHandlerRootView>
        </Modal>

        {/* Phase 2 & 3 Overlays & Sheets */}
        <MessageActionSheet
          visible={isReactionPopupVisible}
          onClose={() => setIsReactionPopupVisible(false)}
          message={activeMessageForReaction}
          onSelectReaction={handleSelectReaction}
          onReply={handleReplyMessage}
          onCopy={handleCopyMessage}
          onDelete={handleDeleteMessage}
        />

        <AttachmentSheet
          visible={isAttachmentSheetVisible}
          onClose={() => setIsAttachmentSheetVisible(false)}
          onSelectOption={(option) => console.log("Selected attachment option:", option)}
        />

        <ProfileDrawer
          visible={isProfileDrawerVisible}
          onClose={() => setIsProfileDrawerVisible(false)}
          otherUser={selectedConversation?.otherUser}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default MessageScreen;
