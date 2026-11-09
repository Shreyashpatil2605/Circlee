import React from "react";
import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSignOut } from "@/hooks/useSignOut";

const SignOutButton: React.FC = () => {
  const { handleSignOut } = useSignOut();
  return (
    <TouchableOpacity
      onPress={handleSignOut}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Sign out"
      className="w-9 h-9 rounded-full bg-[#1B1B25] border border-[#272733] items-center justify-center"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Feather name="log-out" size={16} color="#A1A1AA" />
    </TouchableOpacity>
  );
};

export default SignOutButton;
