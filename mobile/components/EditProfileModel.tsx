import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";
import React from "react";

interface EditProfileModelProps {
  isVisible: boolean;
  onClose: () => void;
  formData: {
    firstName: string;
    lastName: string;
    bio: string;
    location: string;
  };
  saveProfile: () => void;
  updateFormField: (field: string, value: string) => void;
  isUpdating: boolean;
}

const EditProfileModel = ({
  isVisible,
  formData,
  saveProfile,
  updateFormField,
  isUpdating,
  onClose,
}: EditProfileModelProps) => {
  const handleSave = () => {
    saveProfile();
    onClose();
  };
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 ">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-blue-500 text-lg">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold ">Edit Profile</Text>

        <TouchableOpacity
          onPress={saveProfile}
          disabled={isUpdating}
          className={`${isUpdating ? "opacity-50" : ""}`}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="#1DA1F2"></ActivityIndicator>
          ) : (
            <Text className="text-blue-500 text-lg font-semibold"> Save</Text>
          )}
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1 px-4 py-8">
        <View className="space-y-4">
          <View className="space-y-4">
            {/* firstName */}
            <View className="mb-2">
              <Text className="text-gray-500 text-sm mb-2 ">First Name</Text>

              <TextInput
                className="border border-gray-400 rounded-lg p-3 text-base"
                value={formData.firstName}
                onChangeText={(text) => updateFormField("firstName", text)}
                placeholder="Your first Name"
              />
            </View>

            {/* Last Name */}
             <View className="mb-2">
              <Text className="text-gray-500 text-sm mb-2 ">Last Name</Text>

              <TextInput
                className="border border-gray-400 rounded-lg p-3 text-base"
                value={formData.lastName}
                onChangeText={(text) => updateFormField("lastName", text)}
                placeholder="Your last Name"
              />
            </View>

            {/* Bio */}
           <View className="mb-2">
              <Text className="text-gray-500 text-sm mb-2 ">Bio</Text>
              <TextInput
                className="border border-gray-400 rounded-lg p-3 text-base"
                value={formData.bio}
                onChangeText={(text) => updateFormField("bio", text)}
                placeholder="Tell us about yourSelf!!"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            {/* Location */}
             <View className="mb-2">
              <Text className="text-gray-500 text-sm mb-2 ">Location</Text>

              <TextInput
                className="border border-gray-400 rounded-lg p-3 text-base"
                value={formData.location}
                onChangeText={(text) => updateFormField("location", text)}
                placeholder="Where are you located?"
              />
            </View>

          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default EditProfileModel;
