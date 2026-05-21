import { useState, useCallback } from "react";

export interface UseGlassTabBarOptions {
  initialIndex?: number;
  onTabChange?: (index: number) => void;
}

/**
 * Hook for managing glass tab bar state
 *
 * Usage:
 * const { activeTab, setActiveTab } = useGlassTabBar({ initialIndex: 0 });
 */
export const useGlassTabBar = (options: UseGlassTabBarOptions = {}) => {
  const { initialIndex = 0, onTabChange } = options;
  const [activeTab, setActiveTab] = useState(initialIndex);

  const handleTabPress = useCallback(
    (index: number) => {
      setActiveTab(index);
      onTabChange?.(index);
    },
    [onTabChange],
  );

  return {
    activeTab,
    setActiveTab,
    onTabPress: handleTabPress,
  };
};
