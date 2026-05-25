import { useComments } from "@/hooks/useComments";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Post } from "@/types";
import { Text } from "@react-navigation/elements";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  TextInput,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

interface CommentsModalProp {
  selectedPost: Post;
  onClose: () => void;
}

const CommentsModal = ({ selectedPost, onClose }: CommentsModalProp) => {
  const { commentText, setCommentText, createComment, deleteComment, isCreatingComment, isDeletingComment } =
    useComments();

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
        <BlurView intensity={20} tint="dark" className="flex-row items-center justify-between px-4 py-3 border-b border-white/10">
          <TouchableOpacity onPress={handleClose}>
            <Text className="text-neon-purple text-lg">Close</Text>
          </TouchableOpacity>
          <View className="flex-col">
            <Text className="text-lg font-semibold text-white">Comments</Text>
          </View>
          <View className="w-12" />
        </BlurView>
        {selectedPost && (
          <ScrollView className="flex-1">
            {/*ORIGINAL POST */}
            <View className="border-b border-white/10 p-4">
              <View className="flex-row">
                <Image
                  source={{ uri: selectedPost.user.profilePicture }}
                  className="size-12 rounded-full mr-3 border border-neon-purple/50"
                />
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="font-bold mr-1 text-white">
                      {selectedPost.user.firstName} {selectedPost.user.lastName}
                    </Text>
                    <Text className="text-gray-400 ml-1">
                      @{selectedPost.user.username}
                    </Text>
                  </View>
                  {selectedPost.content && (
                    <Text className="text-gray-300 text-base leading-3">
                      {selectedPost.content}
                    </Text>
                  )}
                  {selectedPost.image && (
                    <Image
                      source={{ uri: selectedPost.image }}
                      className="w-full h-48 rounded-2xl mt-3 border border-white/5"
                      resizeMode="cover"
                    />
                  )}
                </View>
                {/* Comments list */}
              </View>
            </View>
            {selectedPost.comments.map((comment) => (
              <View
                key={comment._id}
                className="border-b border-white/5 p-4"
              >
                <View className="flex-row">
                  <Image
                    source={{ uri: comment.user.profilePicture }}
                    className="w-10 h-12 rounded-full mr-3 border border-white/10"
                  />

                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <View className="flex-row items-center flex-1">
                        <Text className="font-bold text-white">
                          {comment.user.firstName} {comment.user.lastName}
                        </Text>
                        <Text className="text-gray-400 text-sm ml-1">
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
                            color={isDeletingComment ? "#555" : "#9D00FF"}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text className="text-gray-300 text-base leading-5 mb-2">
                      {" "}
                      {comment.content}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            {/* add comment input */}
            <View className="p-4 border-t border-white/10">
              <View className="flex-row">
                <Image
                  source={{ uri: currentUser?.profilePicture }}
                  className="size-10 rounded-full mr-3 border border-neon-purple/50"
                />
                <View className="flex-1">
                  <TextInput
                    className="border border-white/10 rounded-lg p-3 text-base mb-3 text-white bg-white/5"
                    placeholder="Write your comment"
                    placeholderTextColor="#A0AEC0"
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  <TouchableOpacity
                    className={`px-4 py-3 rounded-lg self-start ${commentText.trim() ? "bg-neon-purple" : "bg-white/10"}`}
                    style={commentText.trim() ? { shadowColor: '#9D00FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 10 } : {}}
                    onPress={() => createComment(selectedPost._id)}
                    disabled={isCreatingComment || !commentText.trim()}
                  >
                    {isCreatingComment ? (
                      <ActivityIndicator
                        size={"small"}
                        color={"White"}
                      ></ActivityIndicator>
                    ) : (
                      <Text
                        className={`font-semibold ${commentText.trim() ? "text-white" : "text-gray-500"}`}
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
