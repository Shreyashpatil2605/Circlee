import { useApiClient, userApi } from "@/utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCurrentUser } from "./useCurrentUser";
import { Alert } from "react-native";

export const useProfile = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  const [isEditModelVisible, setIsEditModelVisible] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
  });
  const { currentUser } = useCurrentUser();
  const updateProfileMutation = useMutation({
    mutationFn: (profileData: any) => userApi.updateProfile(api, profileData),
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
      });
    }
    setIsEditModelVisible(true);
  };

  const updateFormField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value}));
  };
  return{
    isEditModelVisible,
    formData,
    openEditModel,
    closeEditModel:() => setIsEditModelVisible(false),
    saveProfile:()=>updateProfileMutation.mutate(formData),
    updateFormField,
    isUpdating: updateProfileMutation.isPending,
    refetch:() =>queryClient.invalidateQueries({queryKey:["authUser"]})

  }


};
