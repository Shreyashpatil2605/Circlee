import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { getApiBaseUrl } from "@/config/api.config";

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

  const sendMessageAction = useAction(api.messages.sendMessageAction);
  const updateTyping = useMutation(api.messages.updateTyping);

  const sendMessage = async (
    customContent?: string,
    type?: string,
    audioUrl?: string,
    attachments?: any[]
  ) => {
    if (!conversationId) return;
    const content = customContent !== undefined ? customContent : messageText;
    if (!content.trim() && !attachments) return;

    await sendMessageAction({
      conversationId,
      content,
      type,
      audioUrl,
      attachments,
      apiUrl: getApiBaseUrl(),
    });

    await updateTyping({
      conversationId,
      isTyping: false,
    });

    if (customContent === undefined) {
      setMessageText("");
    }
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
