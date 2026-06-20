import { useComments } from "@/hooks/useComments";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Post } from "@/types";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

interface CommentsModalProp {
  selectedPost: Post;
  onClose: () => void;
}

const CommentsModal = ({ selectedPost, onClose }: CommentsModalProp) => {
  const {
    commentText,
    setCommentText,
    createComment,
    deleteComment,
    isCreatingComment,
    isDeletingComment,
  } = useComments();

  const { currentUser } = useCurrentUser();

  const handleClose = () => {
    onClose();
    setCommentText("");
  };

  return (
    <Modal
      visible={!!selectedPost}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-dark-bg">
        {/* Header */}
        <BlurView
          intensity={70}
          tint="dark"
          className="flex-row items-center justify-between px-4 py-4 border-b border-border-glass-light"
        >
          <TouchableOpacity onPress={handleClose}>
            <Text className="text-accent-blue text-lg font-semibold">
              Close
            </Text>
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-text-primary">
            Comments
          </Text>

          <View className="w-12" />
        </BlurView>

        {selectedPost && (
          <ScrollView className="flex-1 bg-dark-bg">
            {/* Original Post */}
            <View className="border-b border-border-glass-light p-4">
              <View className="flex-row">
                <Image
                  source={{ uri: selectedPost.user.profilePicture }}
                  className="size-12 rounded-full mr-3 border border-accent-blue/30"
                />

                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <Text className="font-bold mr-1 text-text-primary">
                      {selectedPost.user.firstName} {selectedPost.user.lastName}
                    </Text>

                    <Text className="text-text-tertiary ml-1">
                      @{selectedPost.user.username}
                    </Text>
                  </View>

                  {selectedPost.content && (
                    <Text className="text-text-secondary text-base leading-5 mb-3">
                      {selectedPost.content}
                    </Text>
                  )}

                  {selectedPost.image && (
                    <Image
                      source={{ uri: selectedPost.image }}
                      className="w-full h-48 rounded-xl mt-3 border border-border-glass-medium"
                      resizeMode="cover"
                    />
                  )}
                </View>
              </View>
            </View>

            {/* Comments */}
            {selectedPost.comments.map((comment) => (
              <View
                key={comment._id}
                className="border-b border-border-glass-light p-4"
              >
                <View className="flex-row">
                  <Image
                    source={{ uri: comment.user.profilePicture }}
                    className="w-10 h-10 rounded-full mr-3 border border-border-glass-medium"
                  />

                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1">
                        <Text className="font-bold text-text-primary">
                          {comment.user.firstName} {comment.user.lastName}
                        </Text>

                        <Text className="text-text-tertiary text-sm ml-2">
                          @{comment.user.username}
                        </Text>
                      </View>

                      {currentUser?._id === comment.user._id && (
                        <TouchableOpacity
                          onPress={() => deleteComment(comment._id)}
                          disabled={isDeletingComment}
                        >
                          <Feather
                            name="trash-2"
                            size={18}
                            color={isDeletingComment ? "#6B7280" : "#0A84FF"}
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    <Text className="text-text-secondary text-base leading-5">
                      {comment.content}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            {/* Add Comment */}
            <View className="p-4 border-t border-border-glass-light bg-dark-secondary/50">
              <View className="flex-row">
                <Image
                  source={{ uri: currentUser?.profilePicture }}
                  className="size-10 rounded-full mr-3 border border-accent-blue/30"
                />

                <View className="flex-1">
                  <TextInput
                    className="border border-border-glass-medium rounded-xl p-3 text-base mb-3 text-text-primary bg-glass-light"
                    placeholder="Write your comment"
                    placeholderTextColor="#9CA3AF"
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />

                  <TouchableOpacity
                    className={`px-4 py-3 rounded-lg self-start ${
                      commentText.trim() ? "bg-accent-blue" : "bg-glass-light"
                    }`}
                    style={
                      commentText.trim()
                        ? {
                            shadowColor: "#0A84FF",
                            shadowOffset: {
                              width: 0,
                              height: 0,
                            },
                            shadowOpacity: 0.6,
                            shadowRadius: 10,
                            elevation: 5,
                          }
                        : {}
                    }
                    onPress={() => createComment(selectedPost._id)}
                    disabled={isCreatingComment || !commentText.trim()}
                  >
                    {isCreatingComment ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text
                        className={`font-semibold ${
                          commentText.trim() ? "text-white" : "text-gray-500"
                        }`}
                      >
                        Reply
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

export default CommentsModal;
