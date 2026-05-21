import { useState } from "react";
import { Alert } from "react-native";
import { useQuery, useMutation } from "convex/react";
// @ts-ignore
import { api } from "../../convex/_generated/api";

export const useMessages = (conversationId: string) => {
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId: conversationId as any } : "skip"
  );

  const sendMessageMutation = useMutation(api.messages.sendMessage);

  const sendMessage = async () => {
    if (!messageText.trim()) {
      Alert.alert("Empty Message", "Please write something before sending");
      return;
    }
    
    setIsSending(true);
    try {
      await sendMessageMutation({
        conversationId: conversationId as any,
        content: messageText.trim(),
      });
      setMessageText("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send message. Try again.");
      console.log(error);
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages: messages || [],
    isLoadingMessages: messages === undefined && conversationId !== "",
    messagesError: null,
    messageText,
    setMessageText,
    sendMessage,
    isSending,
    refetchMessages: () => {}, 
  };
};

export const useConversations = () => {
  const [isCreating, setIsCreating] = useState(false);
  const conversations = useQuery(api.messages.getConversations);
  const getOrCreateConversationMutation = useMutation(api.messages.getOrCreateConversation);

  const getOrCreateConversation = async (participantId: string) => {
    setIsCreating(true);
    try {
      const id = await getOrCreateConversationMutation({ participantId });
      return { conversation: { _id: id } };
    } catch (error: any) {
      Alert.alert("Cannot Message", error.message || "Failed to create conversation");
      console.log(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    conversations: conversations || [],
    isLoading: conversations === undefined,
    error: null,
    refetch: () => {}, 
    getOrCreateConversation,
    isCreating,
  };
};
