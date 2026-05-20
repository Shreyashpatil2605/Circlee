import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";

interface EditProfileModelProps {
  isVisible: boolean;
  onClose: () => void;
  formData: {
    firstName: string;
    lastName: string;
    bio: string;
    location: string;
    profilePicture: string;
    bannerImage: string;
  };
  saveProfile: () => void;
  updateFormField: (field: string, value: string) => void;
  isUpdating: boolean;
  pickImage: (imageType: "profilePicture" | "bannerImage") => void;
}

const EditProfileModel = ({
  isVisible,
  formData,
  saveProfile,
  updateFormField,
  isUpdating,
  onClose,
  pickImage,
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
          {/* Banner Image */}
          <View className="mb-4">
            <Text className="text-gray-500 text-sm mb-2">Banner Image</Text>
            <TouchableOpacity
              onPress={() => pickImage("bannerImage")}
              className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden"
            >
              {formData.bannerImage ? (
                <>
                  <Image
                    source={{ uri: formData.bannerImage }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute inset-0 bg-black bg-opacity-30 items-center justify-center">
                    <Feather name="camera" size={24} color="white" />
                  </View>
                </>
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Feather name="image" size={24} color="#999" />
                  <Text className="text-gray-500 text-sm mt-2">Add Banner</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Profile Picture */}
          <View className="mb-4">
            <Text className="text-gray-500 text-sm mb-2">Profile Picture</Text>
            <TouchableOpacity
              onPress={() => pickImage("profilePicture")}
              className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden self-center"
            >
              {formData.profilePicture ? (
                <>
                  <Image
                    source={{ uri: formData.profilePicture }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute inset-0 bg-black bg-opacity-30 items-center justify-center">
                    <Feather name="camera" size={18} color="white" />
                  </View>
                </>
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Feather name="user" size={20} color="#999" />
                </View>
              )}
            </TouchableOpacity>
          </View>

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
