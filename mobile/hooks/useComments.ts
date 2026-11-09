import { commentApi, useApiClient } from "@/utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { modalService } from "@/context/ModalContext";

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
      modalService.showToast("Comment posted", "success");
    },
    onError: (error: any) => {
      modalService.showToast("Failed to post comment. Try again.", "error");
      console.log(error.response?.data);
      console.log(error.response?.status);
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await commentApi.deleteComment(api, commentId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      modalService.showToast("Comment deleted", "info");
    },
    onError: (error: any) => {
      modalService.showToast("Failed to delete comment. Try again.", "error");
      console.log(error.response?.data);
      console.log(error.response?.status);
    },
  });

  const createComment = (postId: string) => {
    if (!commentText.trim()) {
      modalService.showToast("Please write something before posting", "warning");
      return;
    }
    createCommentMutation.mutate({ postId, content: commentText.trim() });
  };

  const deleteComment = (commentId: string) => {
    modalService.showAlert({
      title: "Delete Comment?",
      description: "Are you sure you want to delete this comment?",
      icon: "trash-2",
      type: "danger",
      isDestructive: true,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: () => deleteCommentMutation.mutate(commentId),
    });
  };

  return {
    commentText,
    setCommentText,
    createComment,
    deleteComment,
    isCreating: createCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
    isCreatingComment: createCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
  };
};
