import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

export const useConversations = () => {
  const conversations = useQuery(api.messages.getConversations) ?? [];

  const getOrCreateConversation = useMutation(
    api.messages.getOrCreateConversation,
  );

  const markConversationRead = useMutation(api.messages.markConversationRead);


  return {
    conversations,
    isLoading: conversations === undefined,
    getOrCreateConversation,
    markConversationRead,
    isCreating: false,
    refetch: () => {},
  };
};

export const useMessages = (conversationId?: any) => {
  const [messageText, setMessageText] = useState("");

  const messages =
    useQuery(
      api.messages.getMessages,
      conversationId
        ? {
            conversationId,
          }
        : "skip",
    ) ?? [];

  const sendMessageMutation = useMutation(api.messages.sendMessage);
  const updateTyping = useMutation(api.messages.updateTyping);

  const sendMessage = async () => {
    if (!conversationId || !messageText.trim()) return;
    await sendMessageMutation({
      conversationId,
      content: messageText,
    });
    await updateTyping({
      conversationId,
      isTyping: false,
    });

    setMessageText("");
  };
  const conversation = useQuery(
    api.messages.watchConversation,
    conversationId ? { conversationId } : "skip",
  );

  return {
    messages,
    isLoadingMessages: false,
    messageText,
    conversation,
    setMessageText,
    sendMessage,
    isSending: false,
    updateTyping,
  };
};
