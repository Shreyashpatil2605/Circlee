import { useAuth } from "@clerk/clerk-expo";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { getApiBaseUrl } from "@/config/api.config";
import { useApiClient } from "@/utils/api";

export const useConversations = () => {
  const { isSignedIn } = useAuth();
  const conversations =
    useQuery(
      api.messages.getConversations,
      isSignedIn ? {} : "skip",
    ) ?? [];

  const getOrCreateConversation = useMutation(
    api.messages.getOrCreateConversation,
  );

  const markConversationRead = useMutation(api.messages.markConversationRead);
  const deleteConversationMutation = useMutation(api.messages.deleteConversation);
  const togglePinConversationMutation = useMutation(api.messages.togglePinConversation);
  const clearChatMutation = useMutation(api.messages.clearChat);

  return {
    conversations,
    isLoading: conversations === undefined,
    getOrCreateConversation,
    markConversationRead,
    deleteConversation: (conversationId: any) => deleteConversationMutation({ conversationId }),
    togglePinConversation: (conversationId: any) => togglePinConversationMutation({ conversationId }),
    clearChat: (conversationId: any) => clearChatMutation({ conversationId }),
    isCreating: false,
    refetch: () => {},
  };
};

export const useMessages = (conversationId?: any) => {
  const { userId: currentUserId } = useAuth();
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
  const sendMessageMutation = useMutation(api.messages.sendMessage);
  const updateTyping = useMutation(api.messages.updateTyping);

  const sendMessage = async (
    customContent?: string,
    type?: string,
    audioUrl?: string,
    attachments?: any[]
  ) => {
    if (!conversationId) return;
    const content = (customContent !== undefined ? customContent : messageText).trim();
    if (!content && !attachments) return;

    // Immediately clear input field for snappy UX
    setMessageText("");

    try {
      await sendMessageAction({
        conversationId,
        content,
        type,
        audioUrl,
        attachments,
        apiUrl: getApiBaseUrl(),
      });
    } catch (sendErr) {
      console.warn("[useMessages] sendMessageAction failed, falling back to sendMessageMutation:", sendErr);
      try {
        await sendMessageMutation({
          conversationId,
          content,
          type,
          audioUrl,
          attachments,
        });
      } catch (mutationErr) {
        console.error("[useMessages] Failed to send message:", mutationErr);
        // Restore input text if send completely failed
        if (!attachments) {
          setMessageText(content);
        }
        throw mutationErr;
      }
    }

    // Client-side fallback for message notification (fire and forget, non-blocking)
    const recipientId = conversation?.participants?.find((p: string) => p !== currentUserId);
    if (recipientId) {
      apiClient.post("/notifications/message", {
        toClerkId: recipientId,
        conversationId,
        content: content || (type === "voice" ? "Voice message" : "Sent a message"),
        type: type || "text",
      }).catch((notifyErr) => {
        console.warn("[useMessages] Failed to trigger message notification via API:", notifyErr);
      });
    }

    updateTyping({
      conversationId,
      isTyping: false,
    }).catch(() => {});
  };

  const deleteMessageMutation = useMutation(api.messages.deleteMessage);

  const deleteMessage = async (messageId: any, type: "me" | "everyone") => {
    return await deleteMessageMutation({ messageId, type });
  };

  const apiClient = useApiClient();
  const toggleReactionMutation = useMutation(api.messages.toggleReaction);
  const toggleReactionAction = useAction(api.messages.toggleReactionAction);

  const toggleReaction = async (messageId: any, emoji: string) => {
    let result: any;
    try {
      result = await toggleReactionAction({
        messageId,
        emoji,
        apiUrl: getApiBaseUrl(),
      });
    } catch {
      result = await toggleReactionMutation({
        messageId,
        emoji,
      });
    }

    // Trigger notification via mobile client API directly.
    // This ensures notifications succeed reliably in local development
    // (where Convex Cloud in AWS cannot reach private local LAN IPs like 192.168.x.x)
    // as well as in production.
    if (result && result.shouldNotify) {
      try {
        await apiClient.post("/notifications/reaction", {
          toClerkId: result.messageSenderId,
          conversationId: result.conversationId,
          messageId: result.messageId,
          messagePreview: result.messageContent,
          emoji: result.emoji,
        });
        console.log("[useMessages] Reaction notification triggered successfully via API");
      } catch (notifyErr) {
        console.error("[useMessages] Failed to trigger reaction notification via API:", notifyErr);
      }
    }

    return result;
  };

  const conversation = useQuery(
    api.messages.watchConversation,
    conversationId ? { conversationId } : "skip",
  );

  const pinMessageMutation = useMutation(api.messages.pinMessage);
  const unpinMessageMutation = useMutation(api.messages.unpinMessage);
  const togglePinMessageMutation = useMutation(api.messages.togglePinMessage);
  const clearChatMutation = useMutation(api.messages.clearChat);

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
    toggleReaction,
    pinMessage: (messageId: any) => conversationId && pinMessageMutation({ conversationId, messageId }),
    unpinMessage: () => conversationId && unpinMessageMutation({ conversationId }),
    togglePinMessage: (messageId: any) => conversationId && togglePinMessageMutation({ conversationId, messageId }),
    clearChat: () => conversationId && clearChatMutation({ conversationId }),
  };
};
