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
  const deleteConversationMutation = useMutation(api.messages.deleteConversation);

  return {
    conversations,
    isLoading: conversations === undefined,
    getOrCreateConversation,
    markConversationRead,
    deleteConversation: (conversationId: any) => deleteConversationMutation({ conversationId }),
    isCreating: false,
    refetch: () => {},
  };
};

export const useMessages = (conversationId?: any) => {
  const [messageText, setMessageText] = useState("");

  const messagesQuery =
    useQuery(
      api.messages.getMessages,
      conversationId
        ? {
            conversationId,
          }
        : "skip",
    );
  const messages = messagesQuery ?? [];
  const isLoadingMessages = messagesQuery === undefined;

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
  const deleteMessageMutation = useMutation(api.messages.deleteMessage);

  const deleteMessage = async (messageId: any, type: "me" | "everyone") => {
    return await deleteMessageMutation({ messageId, type });
  };

  const conversation = useQuery(
    api.messages.watchConversation,
    conversationId ? { conversationId } : "skip",
  );

  return {
    messages,
    isLoadingMessages,
    messageText,
    conversation,
    setMessageText,
    sendMessage,
    isSending: false,
    updateTyping,
    deleteMessage,
  };
};
