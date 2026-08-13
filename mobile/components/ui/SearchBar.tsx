import React from "react";
import { View, TextInput, TouchableOpacity, TextInputProps } from "react-native";
import { Feather } from "@expo/vector-icons";

interface SearchBarProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Search",
  onClear,
  className = "",
  ...props
}) => {
  return (
    <View className={`flex-row items-center bg-glass-light rounded-full px-4 py-2.5 border border-border-glass-medium ${className}`}>
      <Feather name="search" size={18} color="#0A84FF" />
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        className="flex-1 ml-2.5 text-sm text-text-primary"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        {...props}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear || (() => onChangeText(""))}>
          <Feather name="x" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
