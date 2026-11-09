import { postApi, useApiClient } from "@/utils/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Post, User } from "@/types";
import { useCurrentUser } from "./useCurrentUser";
import { modalService } from "@/context/ModalContext";

export const usePosts = (username?: string) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();
  const queryKey = username ? ["userPosts", username] : ["posts"];

  const {
    data: postData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () =>
      username ? postApi.getUserPosts(api, username) : postApi.getPosts(api),
    select: (response) => response.data.posts,
  });

  // Like Post Mutation with Optimistic Update
  const likePostMutation = useMutation({
    mutationFn: (postId: string) => postApi.likePost(api, postId),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: ["savedPosts"] });
      const previousData = queryClient.getQueryData(queryKey);
      const previousSavedData = queryClient.getQueryData<any>(["savedPosts"]);

      if (currentUser?._id) {
        const userIdStr = currentUser._id.toString();

        const updateLikeList = (postsList: Post[]) =>
          postsList.map((post: Post) => {
            if (post._id !== postId) return post;
            const likes = Array.isArray(post.likes) ? [...post.likes] : [];
            const isLiked = likes.some(
              (id: any) => id?.toString() === userIdStr
            );
            const updatedLikes = isLiked
              ? likes.filter((id: any) => id?.toString() !== userIdStr)
              : [...likes, currentUser._id];

            return {
              ...post,
              likes: updatedLikes,
            };
          });

        if (previousData) {
          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old) return old;
            const postsList: Post[] = Array.isArray(old) ? old : old?.data?.posts;
            if (!Array.isArray(postsList)) return old;
            const updatedPosts = updateLikeList(postsList);
            return Array.isArray(old)
              ? updatedPosts
              : { ...old, data: { ...old.data, posts: updatedPosts } };
          });
        }

        if (previousSavedData) {
          queryClient.setQueryData(["savedPosts"], (old: any) => {
            if (!old) return old;
            const postsList: Post[] = Array.isArray(old) ? old : old?.data?.posts;
            if (!Array.isArray(postsList)) return old;
            const updatedPosts = updateLikeList(postsList);
            return Array.isArray(old)
              ? updatedPosts
              : { ...old, data: { ...old.data, posts: updatedPosts } };
          });
        }
      }

      return { previousData, previousSavedData };
    },
    onError: (err, postId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      if (context?.previousSavedData) {
        queryClient.setQueryData(["savedPosts"], context.previousSavedData);
      }
      modalService.showToast("Failed to update like. Please try again.", "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["savedPosts"] });
      if (username) {
        queryClient.invalidateQueries({ queryKey: ["userPosts", username] });
      }
    },
  });

  // Reshare Post Mutation with Optimistic Update
  const resharePostMutation = useMutation({
    mutationFn: (postId: string) => postApi.resharePost(api, postId),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: ["savedPosts"] });
      const previousData = queryClient.getQueryData(queryKey);
      const previousSavedData = queryClient.getQueryData<any>(["savedPosts"]);

      if (currentUser?._id) {
        const userIdStr = currentUser._id.toString();

        const updateReshareList = (postsList: Post[]) =>
          postsList.map((post: Post) => {
            if (post._id !== postId) return post;
            const reshares = Array.isArray(post.reshares)
              ? [...post.reshares]
              : [];
            const isReshared = reshares.some((item) => {
              const id = typeof item === "string" ? item : item?._id;
              return id?.toString() === userIdStr;
            });

            const updatedReshares = isReshared
              ? reshares.filter((item) => {
                  const id = typeof item === "string" ? item : item?._id;
                  return id?.toString() !== userIdStr;
                })
              : [...reshares, currentUser._id];

            return {
              ...post,
              reshares: updatedReshares,
            };
          });

        if (previousData) {
          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old) return old;
            const postsList: Post[] = Array.isArray(old) ? old : old?.data?.posts;
            if (!Array.isArray(postsList)) return old;
            const updatedPosts = updateReshareList(postsList);
            return Array.isArray(old)
              ? updatedPosts
              : { ...old, data: { ...old.data, posts: updatedPosts } };
          });
        }

        if (previousSavedData) {
          queryClient.setQueryData(["savedPosts"], (old: any) => {
            if (!old) return old;
            const postsList: Post[] = Array.isArray(old) ? old : old?.data?.posts;
            if (!Array.isArray(postsList)) return old;
            const updatedPosts = updateReshareList(postsList);
            return Array.isArray(old)
              ? updatedPosts
              : { ...old, data: { ...old.data, posts: updatedPosts } };
          });
        }
      }

      return { previousData, previousSavedData };
    },
    onError: (err, postId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      if (context?.previousSavedData) {
        queryClient.setQueryData(["savedPosts"], context.previousSavedData);
      }
      modalService.showToast("Failed to update reshare. Please try again.", "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["savedPosts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
    },
  });

  // Save / Bookmark Post Mutation with Optimistic Update on authUser and savedPosts
  const savePostMutation = useMutation({
    mutationFn: (postId: string) => postApi.savePost(api, postId),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["authUser"] });
      await queryClient.cancelQueries({ queryKey: ["savedPosts"] });

      const previousAuthData = queryClient.getQueryData<any>(["authUser"]);
      const previousSavedData = queryClient.getQueryData<any>(["savedPosts"]);

      // 1. Optimistically update authUser savedPosts array
      if (previousAuthData) {
        const user = previousAuthData?.data?.user || previousAuthData?.user || previousAuthData;
        if (user) {
          const savedPosts: string[] = Array.isArray(user.savedPosts)
            ? [...user.savedPosts]
            : [];
          const isSaved = savedPosts.some(
            (id: any) => id?.toString() === postId
          );
          const updatedSaved = isSaved
            ? savedPosts.filter((id: any) => id?.toString() !== postId)
            : [...savedPosts, postId];

          const updatedUser = {
            ...user,
            savedPosts: updatedSaved,
          };

          queryClient.setQueryData(["authUser"], (old: any) => {
            if (!old) return old;
            if (old?.data?.user) {
              return { ...old, data: { ...old.data, user: updatedUser } };
            }
            if (old?.user) {
              return { ...old, user: updatedUser };
            }
            return updatedUser;
          });
        }
      }

      // 2. Optimistically update savedPosts list if active
      if (previousSavedData) {
        queryClient.setQueryData(["savedPosts"], (old: any) => {
          if (!old) return old;
          const postsList: Post[] = Array.isArray(old) ? old : old?.data?.posts;
          if (!Array.isArray(postsList)) return old;

          const updatedList = postsList.filter((p: Post) => p._id !== postId);
          return Array.isArray(old)
            ? updatedList
            : { ...old, data: { ...old.data, posts: updatedList } };
        });
      }

      return { previousAuthData, previousSavedData };
    },
    onError: (err, postId, context) => {
      if (context?.previousAuthData) {
        queryClient.setQueryData(["authUser"], context.previousAuthData);
      }
      if (context?.previousSavedData) {
        queryClient.setQueryData(["savedPosts"], context.previousSavedData);
      }
      modalService.showToast("Failed to update saved posts. Please try again.", "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["savedPosts"] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => postApi.deletePost(api, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["savedPosts"] });
      if (username) {
        queryClient.invalidateQueries({ queryKey: ["userPosts", username] });
      }
    },
  });

  const checkIsLiked = (
    postLikes: string[] | undefined,
    user: any
  ): boolean => {
    if (!user?._id || !Array.isArray(postLikes)) return false;
    const userIdStr = user._id.toString();
    return postLikes.some((id) => id?.toString() === userIdStr);
  };

  const checkIsReshared = (
    postReshares: (string | any)[] | undefined,
    user: any
  ): boolean => {
    if (!user?._id || !Array.isArray(postReshares)) return false;
    const userIdStr = user._id.toString();
    return postReshares.some((item) => {
      const id = typeof item === "string" ? item : item?._id;
      return id?.toString() === userIdStr;
    });
  };

  const checkIsSaved = (postId: string, user: any): boolean => {
    if (!user?._id || !Array.isArray(user.savedPosts)) return false;
    const postIdStr = postId.toString();
    return user.savedPosts.some((id: any) => id?.toString() === postIdStr);
  };

  return {
    posts: postData || [],
    isLoading,
    error,
    refetch,
    toggleLike: (postId: string) => likePostMutation.mutate(postId),
    toggleReshare: (postId: string) => resharePostMutation.mutate(postId),
    toggleSave: (postId: string) => savePostMutation.mutate(postId),
    deletePost: (postId: string) => deletePostMutation.mutate(postId),
    checkIsLiked,
    checkIsReshared,
    checkIsSaved,
  };
};
