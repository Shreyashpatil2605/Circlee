import { commentApi, useApiClient } from "@/utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert } from "react-native";

export const useComments = () => {
  const [commentText, setCommentText] = useState("");
  const api = useApiClient();

  const queryClient = useQueryClient();

  const createCommentMutation = useMutation({
    mutationFn: async ({
      postId,
      content,
    }: {
      postId: string;
      content: string;
    }) => {
      const response = await commentApi.createComment(api, postId, content);
      return response.data;
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error:any) => {
      Alert.alert("Error", "Failed to post comment. Try again.");
      console.log(error.response?.data)
      console.log(error.response?.status)
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await commentApi.deleteComment(api, commentId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: any) => {
      Alert.alert("Error", "Failed to delete comment. Try again.");
      console.log(error.response?.data);
      console.log(error.response?.status);
    },
  });

  const createComment = (postId: string) => {
    if (!commentText.trim()) {
      Alert.alert("Empty Comment", "Please write something before posting");
      return;
    }
    createCommentMutation.mutate({ postId, content: commentText.trim() });
  };

  const deleteComment = (commentId: string) => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => deleteCommentMutation.mutate(commentId),
          style: "destructive",
        },
      ]
    );
  };

  return {
    commentText,
    setCommentText,
    createComment,
    deleteComment,
    isCreatingComment: createCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
  };
};
