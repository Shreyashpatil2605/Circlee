import { useApiClient, userApi } from "@/utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCurrentUser } from "./useCurrentUser";
import * as ImagePicker from "expo-image-picker";
import { modalService } from "@/context/ModalContext";

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
    profilePictureUri: null as string | null,
    bannerImageUri: null as string | null,
  });

  const { currentUser } = useCurrentUser();

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const hasImageUpload = profileData.profilePictureUri || profileData.bannerImageUri;

      if (hasImageUpload) {
        const formDataPayload = new FormData();

        formDataPayload.append("firstName", profileData.firstName);
        formDataPayload.append("lastName", profileData.lastName);
        formDataPayload.append("bio", profileData.bio);
        formDataPayload.append("location", profileData.location);

        if (profileData.profilePictureUri) {
          const uriParts = profileData.profilePictureUri.split(".");
          const fileType = uriParts[uriParts.length - 1];

          formDataPayload.append("profilePicture", {
            uri: profileData.profilePictureUri,
            name: `profile.${fileType}`,
            type: `image/${fileType}`,
          } as any);
        }

        if (profileData.bannerImageUri) {
          const uriParts = profileData.bannerImageUri.split(".");
          const fileType = uriParts[uriParts.length - 1];

          formDataPayload.append("bannerImage", {
            uri: profileData.bannerImageUri,
            name: `banner.${fileType}`,
            type: `image/${fileType}`,
          } as any);
        }

        return userApi.updateProfile(api, formDataPayload);
      } else {
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
      modalService.showToast("Profile updated successfully!", "success");
    },
    onError: (error: any) => {
      modalService.showToast(
        error.response?.data?.error || "Failed to update profile",
        "error"
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
        profilePictureUri: null,
        bannerImageUri: null,
      });
    }
    setIsEditModelVisible(true);
  };

  const updateFormField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async (imageType: "profilePicture" | "bannerImage") => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.status !== "granted") {
      modalService.showAlert({
        title: "Permission Needed",
        description: "Please grant permission to access your photo library in settings.",
        icon: "image",
        type: "warning",
        confirmText: "OK",
        cancelText: "Cancel",
      });
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

  return {
    isEditModelVisible,
    formData,
    openEditModel,
    closeEditModel: () => setIsEditModelVisible(false),
    saveProfile,
    updateFormField,
    isUpdating: updateProfileMutation.isPending,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
    pickImage,
  };
};

export default useProfile;
