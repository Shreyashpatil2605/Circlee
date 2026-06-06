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
import { BlurView } from "expo-blur";

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
      transparent
    >
      <BlurView
        intensity={40}
        tint="dark"
        style={{ flex: 1 }}
      >
        <View className="flex-1 bg-black/50 justify-center px-4">
          <View className="bg-glass-dark rounded-3xl overflow-hidden border border-border-glass-light max-h-[90%]">
            
            {/* Header */}
            <BlurView
              intensity={30}
              tint="dark"
              className="flex-row items-center justify-between px-5 py-4 border-b border-border-glass-light"
            >
              <TouchableOpacity onPress={onClose}>
                <Text className="text-accent-blue text-base">
                  Cancel
                </Text>
              </TouchableOpacity>

              <Text className="text-lg font-bold text-text-primary">
                Edit Profile
              </Text>

              <TouchableOpacity
                onPress={handleSave}
                disabled={isUpdating}
                className="px-4 py-2 rounded-full bg-accent-blue"
              >
                {isUpdating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold">
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </BlurView>

            <ScrollView
              className="px-4 py-5"
              showsVerticalScrollIndicator={false}
            >
              {/* Banner */}
              <View className="mb-6">
                <Text className="text-text-secondary mb-2">
                  Banner Image
                </Text>

                <TouchableOpacity
                  onPress={() => pickImage("bannerImage")}
                  className="h-40 rounded-2xl overflow-hidden bg-glass-medium border border-border-glass-light"
                >
                  {formData.bannerImage ? (
                    <>
                      <Image
                        source={{ uri: formData.bannerImage }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      <View className="absolute inset-0 bg-black/40 items-center justify-center">
                        <Feather
                          name="camera"
                          size={24}
                          color="white"
                        />
                      </View>
                    </>
                  ) : (
                    <View className="flex-1 items-center justify-center">
                      <Feather
                        name="image"
                        size={24}
                        color="#9CA3AF"
                      />
                      <Text className="text-text-tertiary mt-2">
                        Add Banner
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Profile Picture */}
              <View className="mb-6 items-center">
                <Text className="text-text-secondary mb-3">
                  Profile Picture
                </Text>

                <TouchableOpacity
                  onPress={() => pickImage("profilePicture")}
                  className="w-28 h-28 rounded-full overflow-hidden border-2 border-accent-blue"
                  style={{
                    shadowColor: "#0A84FF",
                    shadowOpacity: 0.6,
                    shadowRadius: 15,
                  }}
                >
                  {formData.profilePicture ? (
                    <>
                      <Image
                        source={{ uri: formData.profilePicture }}
                        className="w-full h-full"
                      />
                      <View className="absolute inset-0 bg-black/40 items-center justify-center">
                        <Feather
                          name="camera"
                          size={20}
                          color="white"
                        />
                      </View>
                    </>
                  ) : (
                    <View className="flex-1 bg-glass-medium items-center justify-center">
                      <Feather
                        name="user"
                        size={24}
                        color="#9CA3AF"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Inputs */}
              {[
                {
                  label: "First Name",
                  field: "firstName",
                  value: formData.firstName,
                  placeholder: "First name",
                },
                {
                  label: "Last Name",
                  field: "lastName",
                  value: formData.lastName,
                  placeholder: "Last name",
                },
                {
                  label: "Location",
                  field: "location",
                  value: formData.location,
                  placeholder: "Your location",
                },
              ].map((item) => (
                <View key={item.field} className="mb-4">
                  <Text className="text-text-secondary mb-2">
                    {item.label}
                  </Text>

                  <TextInput
                    value={item.value}
                    onChangeText={(text) =>
                      updateFormField(item.field, text)
                    }
                    placeholder={item.placeholder}
                    placeholderTextColor="#6B7280"
                    className="bg-glass-medium border border-border-glass-light rounded-2xl px-4 py-4 text-text-primary"
                  />
                </View>
              ))}

              {/* Bio */}
              <View className="mb-6">
                <Text className="text-text-secondary mb-2">
                  Bio
                </Text>

                <TextInput
                  value={formData.bio}
                  onChangeText={(text) =>
                    updateFormField("bio", text)
                  }
                  placeholder="Tell us about yourself..."
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="bg-glass-medium border border-border-glass-light rounded-2xl px-4 py-4 text-text-primary min-h-[120px]"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

export default EditProfileModel;