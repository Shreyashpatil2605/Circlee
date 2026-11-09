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
  BackHandler,
  Keyboard,
} from "react-native";
import React, { useEffect, useRef, useState, useMemo } from "react";
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
import { activeChatTracker } from "@/utils/activeChatTracker";
import { LinearGradient } from "expo-linear-gradient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import Animated, {
  SlideInDown,
  useAnimatedKeyboard,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useLocalSearchParams, router } from "expo-router";

// Design System Imports
import AnimatedBackground from "@/components/chat/AnimatedBackground";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import MessageBubble from "@/components/chat/MessageBubble";
import DateSeparator from "@/components/chat/DateSeparator";

// Interactive Overlays & Sheets
import { MessageActionSheet } from "@/components/chat/MessageActionSheet";
import { ConversationActionSheet } from "@/components/chat/ConversationActionSheet";
import TypingIndicator from "@/components/chat/TypingIndicator";
import AttachmentSheet from "@/components/chat/AttachmentSheet";
import ProfileDrawer from "@/components/chat/ProfileDrawer";
import PinnedMessage from "@/components/chat/PinnedMessage";
import { CustomBottomSheet } from "@/components/ui/CustomBottomSheet";
import { CustomAlertDialog } from "@/components/ui/CustomAlertDialog";
import { useModal } from "@/context/ModalContext";

const MessageScreen = () => {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Premium Custom Modal & Sheet states
  const [isChatOptionsSheetVisible, setIsChatOptionsSheetVisible] = useState(false);
  const [isClearChatDialogVisible, setIsClearChatDialogVisible] = useState(false);
  const [isDeleteChatDialogVisible, setIsDeleteChatDialogVisible] = useState(false);
  const [isUnpinDialogVisible, setIsUnpinDialogVisible] = useState(false);
  const [isDeleteMessageSheetVisible, setIsDeleteMessageSheetVisible] = useState(false);
  const [isDeleteForEveryoneDialogVisible, setIsDeleteForEveryoneDialogVisible] = useState(false);
  const [isDeleteForMeDialogVisible, setIsDeleteForMeDialogVisible] = useState(false);

  const { showToast } = useModal();

  // Realtime read status / indicator states
  const [hasNewIncomingMessage, setHasNewIncomingMessage] = useState(false);
  const isMarkingReadRef = useRef(false);

  // Interactive States
  const [isReactionPopupVisible, setIsReactionPopupVisible] = useState(false);
  const [activeMessageForReaction, setActiveMessageForReaction] = useState<any>(null);
  const [isAttachmentSheetVisible, setIsAttachmentSheetVisible] = useState(false);
  const [isProfileDrawerVisible, setIsProfileDrawerVisible] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState<any>(null);

  // Long press Conversation Action Sheet states
  const [selectedConversationForSheet, setSelectedConversationForSheet] = useState<any>(null);
  const [isConversationSheetVisible, setIsConversationSheetVisible] = useState(false);

  // Phase 3 Search & Pinned States
  const [isSearchingInChat, setIsSearchingInChat] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [pinnedMessage, setPinnedMessage] = useState<string | null>(
    "Welcome to the Circleee premium experience! Let's get started. 🚀"
  );
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // 60/120fps UI-thread Keyboard Tracker with Android edge-to-edge support
  const keyboard = useAnimatedKeyboard({
    isStatusBarTranslucentAndroid: true,
    isNavigationBarTranslucentAndroid: true,
  });

  const [fallbackKeyboardHeight, setFallbackKeyboardHeight] = useState(0);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const lastKeyboardHeightRef = useRef(Platform.OS === "ios" ? 336 : 290);
  const [measuredKeyboardHeight, setMeasuredKeyboardHeight] = useState(Platform.OS === "ios" ? 336 : 290);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const h = e.endCoordinates.height;
      if (h > 100) {
        lastKeyboardHeightRef.current = h;
        setMeasuredKeyboardHeight(h);
      }
      setFallbackKeyboardHeight(h);
      setIsEmojiPickerOpen(false);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setFallbackKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const animatedChatContainerStyle = useAnimatedStyle(() => {
    const kbHeight = Math.max(keyboard.height.value, fallbackKeyboardHeight);
    return {
      paddingBottom: isEmojiPickerOpen ? 0 : kbHeight,
    };
  }, [fallbackKeyboardHeight, isEmojiPickerOpen]);

  const { currentUser } = useCurrentUser();
  const api = useApiClient();
  const { markConversationMessagesRead } = useNotifications();

  const {
    conversations,
    isLoading: isLoadingConversations,
    markConversationRead,
    getOrCreateConversation,
    deleteConversation,
    togglePinConversation,
    clearChat: clearConversation,
  } = useConversations();

  const params = useLocalSearchParams();
  const senderClerkId = params.senderClerkId as string | undefined;
  const targetConversationId = params.conversationId as string | undefined;
  const targetMessageId = params.messageId as string | undefined;

  useEffect(() => {
    const checkAndOpenConversation = async () => {
      if ((senderClerkId || targetConversationId) && conversations.length > 0) {
        let conv = conversations.find((c: any) =>
          (targetConversationId && c._id === targetConversationId) ||
          (senderClerkId && c.participants.includes(senderClerkId))
        );

        if (!conv && senderClerkId) {
          await getOrCreateConversation({
            participantId: senderClerkId,
          });
          return;
        }

        if (conv) {
          openConversation(conv);
          if (targetMessageId) {
            setHighlightedMessageId(targetMessageId);
          }
          router.setParams({
            senderClerkId: undefined,
            conversationId: undefined,
            messageId: undefined,
          });
        }
      }
    };

    checkAndOpenConversation();
  }, [senderClerkId, targetConversationId, targetMessageId, conversations]);

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
    toggleReaction,
    pinMessage,
    unpinMessage,
    togglePinMessage,
    clearChat,
  } = useMessages(selectedConversation?._id || "");

  useEffect(() => {
    if (highlightedMessageId && messages && messages.length > 0) {
      const index = messages.findIndex((m: any) => m._id === highlightedMessageId);
      if (index !== -1) {
        const scrollTimer = setTimeout(() => {
          try {
            flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
          } catch {
            // Safe fallback if index cannot be scrolled yet
          }
        }, 350);
        const clearTimer = setTimeout(() => {
          setHighlightedMessageId(null);
        }, 3000);
        return () => {
          clearTimeout(scrollTimer);
          clearTimeout(clearTimer);
        };
      }
    }
  }, [highlightedMessageId, messages]);

  const markAsReadIfUnread = async () => {
    if (isMarkingReadRef.current || !selectedConversation?._id || !messages || messages.length === 0) return;

    const latestMessage = messages[messages.length - 1];
    const isIncoming = latestMessage?.sender?.clerkId !== currentUser?.clerkId;
    const isUnread = latestMessage && !(latestMessage.readBy ?? []).includes(currentUser?.clerkId);

    if (isIncoming && isUnread) {
      try {
        isMarkingReadRef.current = true;
        await markConversationRead({ conversationId: selectedConversation._id });
      } catch (err) {
        console.error("Error marking conversation read:", err);
      } finally {
        isMarkingReadRef.current = false;
      }
    }
  };

  const handleNewMessageIndicatorPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scrollToBottom(true);
    setHasNewIncomingMessage(false);
    markAsReadIfUnread();
  };

  useEffect(() => {
    if (isChatOpen && selectedConversation?._id && messages.length > 0) {
      markConversationMessagesRead(selectedConversation._id);
    }
  }, [messages.length, isChatOpen, selectedConversation]);

  useEffect(() => {
    activeChatTracker.setChatOpen(isChatOpen, selectedConversation?._id);
    return () => {
      activeChatTracker.setChatOpen(false, null);
    };
  }, [isChatOpen, selectedConversation]);

  // BackHandler for Android to close any open modal or chat modal
  useEffect(() => {
    const backAction = () => {
      if (isDeleteForEveryoneDialogVisible) {
        setIsDeleteForEveryoneDialogVisible(false);
        return true;
      }
      if (isDeleteForMeDialogVisible) {
        setIsDeleteForMeDialogVisible(false);
        return true;
      }
      if (isDeleteMessageSheetVisible) {
        setIsDeleteMessageSheetVisible(false);
        return true;
      }
      if (isClearChatDialogVisible) {
        setIsClearChatDialogVisible(false);
        return true;
      }
      if (isDeleteChatDialogVisible) {
        setIsDeleteChatDialogVisible(false);
        return true;
      }
      if (isUnpinDialogVisible) {
        setIsUnpinDialogVisible(false);
        return true;
      }
      if (isChatOptionsSheetVisible) {
        setIsChatOptionsSheetVisible(false);
        return true;
      }
      if (isEmojiPickerOpen) {
        setIsEmojiPickerOpen(false);
        return true;
      }
      if (isChatOpen) {
        closeChatModal();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [
    isDeleteForEveryoneDialogVisible,
    isDeleteForMeDialogVisible,
    isDeleteMessageSheetVisible,
    isClearChatDialogVisible,
    isDeleteChatDialogVisible,
    isUnpinDialogVisible,
    isChatOptionsSheetVisible,
    isEmojiPickerOpen,
    isChatOpen,
  ]);

  const openConversation = async (conversation: any) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setHasNewIncomingMessage(false);
      await markConversationRead({
        conversationId: conversation._id,
      });

      markConversationMessagesRead(conversation._id);

      setSelectedConversation(conversation);

      if (conversation.otherUser?.username) {
        const response = await userApi.getUserProfile(
          api,
          conversation.otherUser.username,
        );

        setSelectedUserProfile(response.data.user);
      }
      setIsChatOpen(true);
      activeChatTracker.setChatOpen(true, conversation._id);
    } catch (error) {
      console.log("PROFILE FETCH ERROR:", error);
      setSelectedConversation(conversation);
      setIsChatOpen(true);
      activeChatTracker.setChatOpen(true, conversation._id);
    }
  };

  const closeChatModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEmojiPickerOpen(false);
    setIsChatOptionsSheetVisible(false);
    setIsClearChatDialogVisible(false);
    setIsDeleteChatDialogVisible(false);
    setIsUnpinDialogVisible(false);
    setIsDeleteMessageSheetVisible(false);
    setIsDeleteForEveryoneDialogVisible(false);
    setIsDeleteForMeDialogVisible(false);
    setIsChatOpen(false);
    activeChatTracker.setChatOpen(false, null);
    setSelectedConversation(null);
    setSelectedUserProfile(null);
    setMessageText("");
    setReplyingToMessage(null);
    setIsSearchingInChat(false);
    setChatSearchQuery("");
    setHasNewIncomingMessage(false);
    prevConversationRef.current = null;
  };

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingActiveRef = useRef(false);

  const handleMessageTextChange = (text: string) => {
    setMessageText(text);
    if (!selectedConversation?._id) return;

    if (text.length > 0 && !isTypingActiveRef.current) {
      isTypingActiveRef.current = true;
      updateTyping({
        conversationId: selectedConversation._id,
        isTyping: true,
      });
    }

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      if (selectedConversation?._id && isTypingActiveRef.current) {
        isTypingActiveRef.current = false;
        updateTyping({
          conversationId: selectedConversation._id,
          isTyping: false,
        });
      }
    }, 2000);
  };

  const handleHeaderMorePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsChatOptionsSheetVisible(true);
  };

  const handleClearChatConfirm = () => {
    setIsClearChatDialogVisible(true);
  };

  const executeClearChat = async () => {
    const targetConversation = selectedConversation || selectedConversationForSheet;
    if (!targetConversation?._id) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      const res = await clearConversation(targetConversation._id);
      if (res?.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        hasScrolledInitially.current = false;
        isAtBottom.current = true;
        prevMessagesLengthRef.current = 0;
        latestMessageIdRef.current = null;
        setIsConversationSheetVisible(false);
        showToast("Messages have been cleared for you.", "success", "Chat Cleared");
      } else {
        throw new Error("Clear mutation did not return success");
      }
    } catch (err) {
      console.error("Clear chat error:", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast("Could not clear chat. Please try again.", "error");
    }
  };

  const handlePressPinnedMessage = () => {
    const pinned = conversation?.pinnedMessage;
    if (!pinned?.messageId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const msgIndex = messages.findIndex((m: any) => m._id === pinned.messageId);
    if (msgIndex !== -1) {
      flatListRef.current?.scrollToIndex({ index: msgIndex, animated: true, viewPosition: 0.5 });
      setHighlightedMessageId(pinned.messageId);
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 3000);
    } else {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  };

  const handleUnpinPinnedMessage = () => {
    setIsUnpinDialogVisible(true);
  };

  const handleTogglePinFromSheet = async () => {
    if (!activeMessageForReaction?._id) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await togglePinMessage(activeMessageForReaction._id);
      showToast(
        conversation?.pinnedMessage?.messageId === activeMessageForReaction?._id
          ? "Message unpinned"
          : "Message pinned",
        "info"
      );
    } catch (err) {
      console.error("Error toggling pin message:", err);
      showToast("Could not pin/unpin message. Please try again.", "error");
    }
  };

  const handleDeleteChatConfirm = () => {
    setIsDeleteChatDialogVisible(true);
  };

  const executeDeleteChat = async () => {
    const targetConversation = selectedConversation || selectedConversationForSheet;
    if (!targetConversation?._id) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      const res = await deleteConversation(targetConversation._id);
      if (res?.success) {
        if (isChatOpen && selectedConversation?._id === targetConversation._id) {
          closeChatModal();
        }
        setSelectedConversation(null);
        setSelectedConversationForSheet(null);
        setReplyingToMessage(null);
        setActiveMessageForReaction(null);
        setIsReactionPopupVisible(false);
        setIsConversationSheetVisible(false);
        // Reset scroll refs
        hasScrolledInitially.current = false;
        isAtBottom.current = true;
        prevMessagesLengthRef.current = 0;
        latestMessageIdRef.current = null;
        showToast("Conversation deleted", "info");
      } else {
        throw new Error("Mutation did not return success");
      }
    } catch (err) {
      console.error("Delete conversation error:", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast("Could not delete chat. Please try again.", "error");
    }
  };

  const handleTogglePinConversation = async () => {
    const targetConversation = selectedConversation || selectedConversationForSheet;
    if (!targetConversation) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await togglePinConversation(targetConversation._id);
      showToast(targetConversation.isPinned ? "Chat unpinned" : "Chat pinned to top", "info");
    } catch (err) {
      console.error("Toggle pin conversation error:", err);
      showToast("Could not pin/unpin chat. Please try again.", "error");
    }
  };

  const handleMuteConversation = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast("Notification muting is coming in a future update.", "info", "Mute Notifications");
  };

  const handleDeleteConversationFromSheet = () => {
    if (!selectedConversationForSheet) return;
    handleDeleteChatConfirm();
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

  const filteredConversations = conversations.filter((conv: any) => {
    const query = searchText.toLowerCase();
    const firstName = conv.otherUser?.firstName?.toLowerCase() || "";
    const lastName = conv.otherUser?.lastName?.toLowerCase() || "";
    const username = conv.otherUser?.username?.toLowerCase() || "";
    return (
      firstName.includes(query) ||
      lastName.includes(query) ||
      username.includes(query)
    );
  });

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
    const wasAtBottom = isAtBottom.current;
    isAtBottom.current = distanceFromBottom < 100;

    if (isAtBottom.current && !wasAtBottom) {
      if (hasNewIncomingMessage) {
        setHasNewIncomingMessage(false);
      }
      markAsReadIfUnread();
    }
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
    if (!isChatOpen) return;

    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setTimeout(() => {
          scrollToBottom(true);
        }, 120);
      }
    );

    return () => {
      showSub.remove();
    };
  }, [isChatOpen, messages]);

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
          if (!isOwnMessage) {
            markAsReadIfUnread();
          }
        } else {
          if (!isOwnMessage) {
            setHasNewIncomingMessage(true);
          }
        }
      } else {
        if (isAtBottom.current && !isOwnMessage) {
          markAsReadIfUnread();
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

  const liveConversation = useMemo(() => {
    if (!selectedConversation?._id) return selectedConversation;
    return (
      conversations?.find((c: any) => c._id === selectedConversation._id) ||
      selectedConversation
    );
  }, [conversations, selectedConversation]);

  const activeOtherUser = liveConversation?.otherUser;
  const otherUserLastSeen = activeOtherUser?.lastSeen || (selectedUserProfile?.lastSeen ? new Date(selectedUserProfile.lastSeen).getTime() : null);
  const isRecentlyActive =
    Boolean(activeOtherUser?.isOnline) ||
    Boolean(otherUserLastSeen && Date.now() - Number(otherUserLastSeen) < 60000);

  const lastSeenText = isRecentlyActive
    ? "Active Now"
    : otherUserLastSeen
    ? `Last seen ${formatDistanceToNow(new Date(otherUserLastSeen), {
        addSuffix: true,
      })}`
    : "Offline";

  const handleLongPressBubble = (message: any) => {
    setActiveMessageForReaction(message);
    setIsReactionPopupVisible(true);
  };

  const isTogglingReactionRef = useRef(false);

  const handleSelectReaction = async (emoji: string) => {
    if (!activeMessageForReaction) return;
    const msgId = activeMessageForReaction._id;
    if (isTogglingReactionRef.current) return;
    isTogglingReactionRef.current = true;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await toggleReaction(msgId, emoji);
    } catch (err) {
      console.error("Failed to toggle reaction:", err);
    } finally {
      isTogglingReactionRef.current = false;
    }
  };

  const handleToggleReactionOnMessage = async (messageId: any, emoji: string) => {
    if (isTogglingReactionRef.current) return;
    isTogglingReactionRef.current = true;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await toggleReaction(messageId, emoji);
    } catch (err) {
      console.error("Failed to toggle reaction directly on bubble:", err);
    } finally {
      isTogglingReactionRef.current = false;
    }
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
      setIsDeleteMessageSheetVisible(true);
    } else {
      setIsDeleteForMeDialogVisible(true);
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

  const renderChatContent = () => (
    <Animated.View
      style={[{ flex: 1 }, animatedChatContainerStyle]}
      className="flex-1 flex-col relative bg-chat-bg"
    >
        {/* Animated Background */}
        <AnimatedBackground />

        {/* Custom Chat Header */}
        <ChatHeader
          onBackPress={closeChatModal}
          onProfilePress={() => setIsProfileDrawerVisible(true)}
          onSearchPress={() => setIsSearchingInChat(!isSearchingInChat)}
          onMorePress={handleHeaderMorePress}
          otherUser={activeOtherUser}
          isTyping={isTyping}
          lastSeenText={lastSeenText}
        />

        {/* Chat Search Sub-bar */}
        {isSearchingInChat && (
          <Animated.View
            entering={SlideInDown.duration(200)}
            className="w-full z-40 bg-chat-secondary border-b border-chat-divider px-4 py-2.5 flex-row items-center justify-between"
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
        {conversation?.pinnedMessage && !isSearchingInChat && (
          <PinnedMessage
            content={conversation.pinnedMessage.content}
            senderName={conversation.pinnedMessage.senderName}
            onDismiss={handleUnpinPinnedMessage}
            onPress={handlePressPinnedMessage}
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
            style={{ flex: 1 }}
            data={messages}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{
              paddingTop: 8,
              paddingBottom: 12,
            }}
            onContentSizeChange={handleContentSizeChange}
            onScroll={handleScroll}
            onScrollBeginDrag={() => {
              if (isEmojiPickerOpen) {
                setIsEmojiPickerOpen(false);
              }
            }}
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            renderItem={({ item: message, index }) => {
              const previousMessage = index > 0 ? messages[index - 1] : null;
              const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

              const showDateSeparator =
                !previousMessage ||
                getMessageDateLabel(previousMessage.createdAt) !==
                  getMessageDateLabel(message.createdAt);

              const isOwnMessage =
                message.sender?.clerkId === currentUser?.clerkId;
              const activeReactions = message.reactions || [];

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
                    currentUserId={currentUser?.clerkId}
                    onReactionPress={(emoji) => handleToggleReactionOnMessage(message._id, emoji)}
                    isGroupedWithPrevious={isGroupedWithPrevious}
                    isGroupedWithNext={isGroupedWithNext}
                    searchQuery={chatSearchQuery}
                    isHighlighted={message._id === highlightedMessageId}
                  />
                </View>
              );
            }}
            ListFooterComponent={isTyping ? <TypingIndicator /> : null}
            scrollEnabled
            onScrollToIndexFailed={() => {}}
          />
        )}

        {/* Floating New Message Indicator */}
        {hasNewIncomingMessage && (
          <TouchableOpacity
            onPress={handleNewMessageIndicatorPress}
            activeOpacity={0.9}
            className="absolute bottom-20 self-center bg-chat-purple px-4 py-2.5 rounded-full flex-row items-center justify-center shadow-lg z-50 border border-chat-purple/20"
            style={{
              shadowColor: "#6B4EFF",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Feather name="arrow-down" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text className="text-white text-xs font-bold">New Message</Text>
          </TouchableOpacity>
        )}

        {/* Reply Preview Banner */}
        {replyingToMessage && (
          <View className="mx-4 mb-2 bg-chat-card/95 border border-chat-divider rounded-2xl px-4 py-2.5 flex-row items-center justify-between z-40">
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
          onChangeText={handleMessageTextChange}
          onSend={handleSendMessage}
          onAttachmentPress={() => {
            setIsEmojiPickerOpen(false);
            setIsAttachmentSheetVisible(true);
          }}
          onSendVoice={async (attachments) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await sendMessage("", "voice", undefined, attachments);
          }}
          onEmojiPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          isSending={isSending}
          isEmojiPickerOpen={isEmojiPickerOpen}
          setIsEmojiPickerOpen={setIsEmojiPickerOpen}
          keyboardHeight={measuredKeyboardHeight}
        />
    </Animated.View>
  );

  const renderSharedOverlays = () => (
    <>
      <MessageActionSheet
        visible={isReactionPopupVisible}
        onClose={() => setIsReactionPopupVisible(false)}
        message={
          activeMessageForReaction
            ? messages.find((m: any) => m._id === activeMessageForReaction._id) || activeMessageForReaction
            : null
        }
        onSelectReaction={handleSelectReaction}
        onReply={handleReplyMessage}
        onCopy={handleCopyMessage}
        onTogglePin={handleTogglePinFromSheet}
        isPinned={conversation?.pinnedMessage?.messageId === activeMessageForReaction?._id}
        onDelete={handleDeleteMessage}
        currentUserId={currentUser?.clerkId}
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
        conversationId={selectedConversation?._id}
        messages={messages}
      />

      <ConversationActionSheet
        visible={isConversationSheetVisible}
        conversation={selectedConversationForSheet}
        onClose={() => {
          setIsConversationSheetVisible(false);
          setSelectedConversationForSheet(null);
        }}
        onPin={handleTogglePinConversation}
        onMute={handleMuteConversation}
        onClearChat={handleClearChatConfirm}
        onDelete={handleDeleteConversationFromSheet}
      />

      {/* 1. Chat Options Bottom Sheet */}
      <CustomBottomSheet
        visible={isChatOptionsSheetVisible}
        onClose={() => setIsChatOptionsSheetVisible(false)}
        title="Chat Options"
        description={
          activeOtherUser
            ? `Conversation with ${
                activeOtherUser.firstName
                  ? `${activeOtherUser.firstName} ${activeOtherUser.lastName || ""}`.trim()
                  : activeOtherUser.username || "User"
              }`
            : undefined
        }
        headerIcon="message-circle"
        actions={[
          {
            label: "Search Messages",
            sublabel: "Find text within this conversation",
            icon: "search",
            iconColor: "#8D6CFF",
            iconBg: "rgba(141, 108, 255, 0.15)",
            onPress: () => setIsSearchingInChat(true),
          },
          {
            label: selectedConversation?.isPinned ? "Unpin Conversation" : "Pin Conversation",
            sublabel: selectedConversation?.isPinned
              ? "Remove from top of chat list"
              : "Keep at the top of your list",
            icon: "pin",
            iconType: "material",
            iconColor: "#00B0FF",
            iconBg: "rgba(0, 176, 255, 0.15)",
            onPress: handleTogglePinConversation,
          },
          {
            label: "Mute Notifications",
            sublabel: "Silence alert sounds & notifications",
            icon: "bell-off",
            iconColor: "#F59E0B",
            iconBg: "rgba(245, 158, 11, 0.15)",
            onPress: handleMuteConversation,
          },
          {
            label: "Clear Chat",
            sublabel: "Clear all message history for you",
            icon: "trash-2",
            isDestructive: true,
            onPress: handleClearChatConfirm,
          },
          {
            label: "Delete Conversation",
            sublabel: "Remove this entire conversation",
            icon: "trash",
            isDestructive: true,
            onPress: handleDeleteChatConfirm,
          },
        ]}
        cancelButtonText="Cancel"
      />

      {/* 2. Clear Chat Confirmation Dialog */}
      <CustomAlertDialog
        visible={isClearChatDialogVisible}
        onClose={() => setIsClearChatDialogVisible(false)}
        title="Clear chat history?"
        description="This will clear all messages in this conversation for you. Other participants will still be able to see them."
        icon="trash-2"
        isDestructive={true}
        confirmText="Clear Chat"
        cancelText="Cancel"
        onConfirm={executeClearChat}
      />

      {/* 3. Delete Chat Confirmation Dialog */}
      <CustomAlertDialog
        visible={isDeleteChatDialogVisible}
        onClose={() => setIsDeleteChatDialogVisible(false)}
        title="Delete conversation?"
        description="This will permanently remove this conversation from your chat list."
        icon="trash"
        isDestructive={true}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={executeDeleteChat}
      />

      {/* 4. Unpin Pinned Message Dialog */}
      <CustomAlertDialog
        visible={isUnpinDialogVisible}
        onClose={() => setIsUnpinDialogVisible(false)}
        title="Unpin message?"
        description="This will unpin the message for everyone in this conversation."
        icon="bookmark"
        isDestructive={true}
        confirmText="Unpin"
        cancelText="Cancel"
        onConfirm={async () => {
          try {
            await unpinMessage();
            showToast("Message unpinned", "info");
          } catch (err) {
            console.error("Error unpinning message:", err);
            showToast("Could not unpin message.", "error");
          }
        }}
      />

      {/* 5. Delete Message Options Sheet (for own message) */}
      <CustomBottomSheet
        visible={isDeleteMessageSheetVisible}
        onClose={() => setIsDeleteMessageSheetVisible(false)}
        title="Delete Message"
        description="Choose how you want to delete this message"
        actions={[
          {
            label: "Delete for me",
            sublabel: "Remove from your device only",
            icon: "user-x",
            isDestructive: true,
            onPress: async () => {
              if (!activeMessageForReaction) return;
              try {
                await deleteMessage(activeMessageForReaction._id, "me");
                showToast("Message deleted for you", "info");
              } catch (err) {
                console.error("Delete for me error:", err);
                showToast("Failed to delete message", "error");
              }
            },
          },
          {
            label: "Delete for everyone",
            sublabel: "Remove for all participants in this chat",
            icon: "trash-2",
            isDestructive: true,
            onPress: () => {
              setIsDeleteForEveryoneDialogVisible(true);
            },
          },
        ]}
        cancelButtonText="Cancel"
      />

      {/* 6. Delete For Everyone Confirmation Dialog */}
      <CustomAlertDialog
        visible={isDeleteForEveryoneDialogVisible}
        onClose={() => setIsDeleteForEveryoneDialogVisible(false)}
        title="Delete for everyone?"
        description="This message will be permanently removed for everyone in this conversation."
        icon="trash-2"
        isDestructive={true}
        confirmText="Delete for everyone"
        cancelText="Cancel"
        onConfirm={async () => {
          if (!activeMessageForReaction) return;
          try {
            await deleteMessage(activeMessageForReaction._id, "everyone");
            showToast("Message deleted for everyone", "info");
          } catch (err) {
            console.error("Delete for everyone error:", err);
            showToast("Failed to delete message", "error");
          }
        }}
      />

      {/* 7. Delete For Me Confirmation Dialog (for incoming message) */}
      <CustomAlertDialog
        visible={isDeleteForMeDialogVisible}
        onClose={() => setIsDeleteForMeDialogVisible(false)}
        title="Delete message?"
        description="Delete this message for you? Other participants will still see it."
        icon="trash-2"
        isDestructive={true}
        confirmText="Delete for me"
        cancelText="Cancel"
        onConfirm={async () => {
          if (!activeMessageForReaction) return;
          try {
            await deleteMessage(activeMessageForReaction._id, "me");
            showToast("Message deleted for you", "info");
          } catch (err) {
            console.error("Delete for me error:", err);
            showToast("Failed to delete message", "error");
          }
        }}
      />
    </>
  );

  // On Android: Render chat directly inside MainActivity to leverage native windowSoftInputMode="adjustResize"
  if (Platform.OS === "android" && isChatOpen) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 bg-chat-bg">
          {renderChatContent()}
          {renderSharedOverlays()}
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        edges={["top"]}
        className="flex-1 bg-chat-bg"
      >
        <AnimatedBackground />

        {/* Header */}
        <View className="px-5 pt-2 pb-4 flex-row items-center justify-between border-b border-chat-divider/50">
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
            renderItem={({ item: conv }) => {
              const hasUnread = conv.unreadCount > 0;
              const isPinned = conv.isPinned === true;
              const isMuted = false;

              return (
                <TouchableOpacity
                  onPress={() => openConversation(conv)}
                  onLongPress={() => {
                    if (conv) {
                      setSelectedConversationForSheet(conv);
                      setIsConversationSheetVisible(true);
                    }
                  }}
                  delayLongPress={400}
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

                    {(conv.otherUser?.isOnline || (conv.otherUser?.lastSeen && Date.now() - Number(conv.otherUser.lastSeen) < 60000)) && (
                      <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-chat-green rounded-full border-[3px] border-chat-bg" />
                    )}
                  </View>

                  {/* Info block */}
                  <View className="flex-1 justify-center">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1 mr-2">
                        {isPinned && (
                          <MaterialCommunityIcons name="pin" size={14} color="#8D6CFF" style={{ marginRight: 4 }} />
                        )}
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

        {/* On iOS: Native Modal presentation */}
        {Platform.OS === "ios" && (
          <Modal
            visible={isChatOpen}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={closeChatModal}
          >
            <GestureHandlerRootView style={{ flex: 1 }}>
              {renderChatContent()}
            </GestureHandlerRootView>
          </Modal>
        )}

        {renderSharedOverlays()}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default MessageScreen;
