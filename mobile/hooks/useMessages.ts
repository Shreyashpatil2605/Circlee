import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

export const useConversations = () => {
  const conversations =
    useQuery(api.messages.getConversations) ?? [];

  const getOrCreateConversation = useMutation(
    api.messages.getOrCreateConversation
  );

  return {
    conversations,
    isLoading: conversations === undefined,
    getOrCreateConversation,
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
        : "skip"
    ) ?? [];

  const sendMessageMutation = useMutation(
    api.messages.sendMessage
  );

  const sendMessage = async () => {
    if (!conversationId || !messageText.trim()) return;

    await sendMessageMutation({
      conversationId,
      content: messageText,
    });

    setMessageText("");
  };

  return {
    messages,
    isLoadingMessages: false,
    messageText,
    setMessageText,
    sendMessage,
    isSending: false,
  };
};