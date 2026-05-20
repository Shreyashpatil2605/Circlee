import { useApiClient, userApi } from "@/utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCurrentUser } from "./useCurrentUser";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

export const useProfile = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  const [isEditModelVisible, setIsEditModelVisible] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    profilePicture: "",
    bannerImage: "",
  });
  const { currentUser } = useCurrentUser();
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      // If there are image files, send as FormData
      if (profileData.profilePictureUri || profileData.bannerImageUri) {
        const formData = new FormData();
        formData.append("firstName", profileData.firstName);
        formData.append("lastName", profileData.lastName);
        formData.append("bio", profileData.bio);
        formData.append("location", profileData.location);

        if (profileData.profilePictureUri) {
          const urlParts = profileData.profilePictureUri.split(".");
          const fileType = urlParts[urlParts.length - 1].toLowerCase();
          const mimeTypeMap: Record<string, string> = {
            png: "image/png",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            gif: "image/gif",
            webp: "image/webp",
          };
          const mimeType = mimeTypeMap[fileType] || "image/jpeg";
          formData.append("profilePicture", {
            uri: profileData.profilePictureUri,
            name: `profilePicture.${fileType}`,
            type: mimeType,
          } as any);
        }

        if (profileData.bannerImageUri) {
          const urlParts = profileData.bannerImageUri.split(".");
          const fileType = urlParts[urlParts.length - 1].toLowerCase();
          const mimeTypeMap: Record<string, string> = {
            png: "image/png",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            gif: "image/gif",
            webp: "image/webp",
          };
          const mimeType = mimeTypeMap[fileType] || "image/jpeg";
          formData.append("bannerImage", {
            uri: profileData.bannerImageUri,
            name: `bannerImage.${fileType}`,
            type: mimeType,
          } as any);
        }

        return api.put("/users/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // No images, send as JSON
        return userApi.updateProfile(api, {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          bio: profileData.bio,
          location: profileData.location,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setIsEditModelVisible(false);
      Alert.alert("Success", "Profile updated successfully!");
    },

    onError: (error: any) => {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to update profile",
      );
    },
  });

  const openEditModel = () => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        bio: currentUser.bio || "",
        location: currentUser.location || "",
        profilePicture: currentUser.profilePicture || "",
        bannerImage: currentUser.bannerImage || "",
      });
    }
    setIsEditModelVisible(true);
  };

  const updateFormField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value}));
  };

  const pickImage = async (imageType: "profilePicture" | "bannerImage") => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant permission to access your photo library",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: imageType === "profilePicture" ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (imageType === "profilePicture") {
        setFormData((prev) => ({
          ...prev,
          profilePicture: result.assets[0].uri,
          profilePictureUri: result.assets[0].uri,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          bannerImage: result.assets[0].uri,
          bannerImageUri: result.assets[0].uri,
        }));
      }
    }
  };

  const saveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  return{
    isEditModelVisible,
    formData,
    openEditModel,
    closeEditModel:() => setIsEditModelVisible(false),
    saveProfile,
    updateFormField,
    isUpdating: updateProfileMutation.isPending,
    refetch:() =>queryClient.invalidateQueries({queryKey:["authUser"]}),
    pickImage,
  }


};
