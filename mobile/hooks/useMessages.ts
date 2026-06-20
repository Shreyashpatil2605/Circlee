import { useState } from "react";
import { Alert } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient, messageApi } from "../utils/api";

export const useMessages = (conversationId: string) => {
  const [messageText, setMessageText] = useState("");
  const queryClient = useQueryClient();
  const api = useApiClient();

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const response = await messageApi.getMessages(api, conversationId);
      return response.data.messages || [];
    },
    enabled: !!conversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await messageApi.sendMessage(api, conversationId, content);
      return response.data;
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to send message. Try again.",
      );
    },
  });

  const sendMessage = async () => {
    if (!messageText.trim()) {
      Alert.alert("Empty Message", "Please write something before sending");
      return;
    }
    await sendMessageMutation.mutate(messageText.trim());
  };

  return {
    messages,
    isLoadingMessages,
    messagesError: null,
    messageText,
    setMessageText,
    sendMessage,
    isSending: sendMessageMutation.isPending,
    refetchMessages: () =>
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] }),
  };
};

export const useConversations = () => {
  const queryClient = useQueryClient();
  const api = useApiClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await messageApi.getConversations(api);
      return response.data.conversations || [];
    },
  });

  const getOrCreateConversationMutation = useMutation({
    mutationFn: async (participantId: string) => {
      const response = await messageApi.getOrCreateConversation(api, participantId);
      return response.data.conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: any) => {
      Alert.alert(
        "Cannot Message",
        error.response?.data?.message || "Failed to create conversation",
      );
    },
  });

  const getOrCreateConversation = async (participantId: string) => {
    const result =
      await getOrCreateConversationMutation.mutateAsync(participantId);
    return { conversation: result };
  };

  return {
    conversations,
    isLoading,
    error: null,
    refetch: () =>
      queryClient.invalidateQueries({ queryKey: ["conversations"] }),
    getOrCreateConversation,
    isCreating: getOrCreateConversationMutation.isPending,
  };
};

