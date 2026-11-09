import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
  TextInputProps,
  StyleSheet,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

export interface SearchBarRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
}

export interface SearchBarProps
  extends Omit<TextInputProps, "value" | "onChangeText"> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onFilterPress?: () => void;
  hasActiveFilters?: boolean;
  className?: string;
}

export const SearchBar = forwardRef<SearchBarRef, SearchBarProps>(
  (
    {
      value,
      onChangeText,
      placeholder = "Search people, posts, hashtags...",
      onClear,
      onFilterPress,
      hasActiveFilters = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => {
        onChangeText("");
        onClear?.();
      },
      isFocused: () => isFocused,
    }));

    const handleClear = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (onClear) {
        onClear();
      } else {
        onChangeText("");
      }
      inputRef.current?.focus();
    };

    const handleFilter = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onFilterPress?.();
    };

    const handleContainerPress = () => {
      inputRef.current?.focus();
    };

    return (
      <Pressable
        onPress={handleContainerPress}
        style={[styles.container, isFocused && styles.containerFocused]}
        accessibilityRole="search"
      >
        <View style={styles.iconWrapper} pointerEvents="none">
          <Feather
            name="search"
            size={18}
            color={isFocused ? "#8B5CF6" : "#A855F7"}
          />
        </View>

        <TextInput
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
          placeholderTextColor="#9999A8"
          autoCapitalize="none"
          autoCorrect={false}
          editable={true}
          showSoftInputOnFocus={true}
          returnKeyType="search"
          textAlignVertical="center"
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />

        {value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            activeOpacity={0.7}
            style={styles.iconBtn}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            accessibilityLabel="Clear search text"
            accessibilityRole="button"
          >
            <Feather name="x-circle" size={16} color="#9999A8" />
          </TouchableOpacity>
        )}

        {onFilterPress && (
          <TouchableOpacity
            onPress={handleFilter}
            activeOpacity={0.7}
            style={[styles.filterBtn, hasActiveFilters && styles.filterBtnActive]}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            accessibilityLabel="Filter options"
            accessibilityRole="button"
          >
            <Feather
              name="sliders"
              size={16}
              color={hasActiveFilters ? "#8B5CF6" : "#9999A8"}
            />
          </TouchableOpacity>
        )}
      </Pressable>
    );
  }
);

SearchBar.displayName = "SearchBar";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#171720",
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: "#30303C",
  },
  containerFocused: {
    borderColor: "#8B5CF6",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  iconWrapper: {
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: Platform.OS === "android" ? 0 : 0,
    paddingHorizontal: 0,
    textAlignVertical: "center",
  },
  iconBtn: {
    padding: 6,
    marginLeft: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtn: {
    padding: 6,
    marginLeft: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnActive: {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
  },
});

export default SearchBar;
