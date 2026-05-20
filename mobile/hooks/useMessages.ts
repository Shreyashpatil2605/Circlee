import { messageApi, useApiClient } from "@/utils/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert } from "react-native";

export const useMessages = (conversationId: string) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState("");

  // Query for fetching messages
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const response = await messageApi.getMessages(api, conversationId);
      return response.data.messages;
    },
    enabled: !!conversationId,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await messageApi.sendMessage(api, conversationId, content);
      return response.data;
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error.response?.data?.error ||
          "Failed to send message. Try again."
      );
      console.log(error.response?.data);
    },
  });

  const sendMessage = () => {
    if (!messageText.trim()) {
      Alert.alert("Empty Message", "Please write something before sending");
      return;
    }
    sendMessageMutation.mutate(messageText.trim());
  };

  return {
    messages,
    isLoadingMessages,
    messagesError,
    messageText,
    setMessageText,
    sendMessage,
    isSending: sendMessageMutation.isPending,
    refetchMessages,
  };
};

export const useConversations = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  const {
    data: conversations = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await messageApi.getConversations(api);
      return response.data.conversations;
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const getOrCreateConversationMutation = useMutation({
    mutationFn: async (participantId: string) => {
      const response = await messageApi.getOrCreateConversation(
        api,
        participantId,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error ||
        "Failed to create conversation";
      Alert.alert("Cannot Message", errorMessage);
      console.log(error.response?.data);
    },
  });

  return {
    conversations,
    isLoading,
    error,
    refetch,
    getOrCreateConversation: getOrCreateConversationMutation.mutate,
    isCreating: getOrCreateConversationMutation.isPending,
  };
};
