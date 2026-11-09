import { Redirect, useLocalSearchParams, usePathname, useSegments } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { GlassBottomTabBar, TabBarItem } from "@/components/GlassBottomTabBar";
import HomeScreen from "./index";
import SearchScreen from "./search";
import MessagesScreen from "./messages";
import NotificationsScreen from "./notifications";
import ProfileScreen from "./profile";
import { useConversations } from "@/hooks/useMessages";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNotifications } from "@/hooks/useNotifications";
import { tabNavigation } from "@/utils/tabNavigation";
import { activeChatTracker } from "@/utils/activeChatTracker";

const TabsLayout: React.FC = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const { conversations } = useConversations();
  const { currentUser } = useCurrentUser();
  const { notifications } = useNotifications();
  const segments = useSegments();
  const pathname = usePathname();
  const params = useLocalSearchParams();

  const [isChatOpen, setIsChatOpen] = useState(activeChatTracker.isChatOpen);

  // 1. Subscribe to programmatic tab navigation events
  useEffect(() => {
    const unsubscribe = tabNavigation.subscribe((targetTab) => {
      setActiveTab(targetTab);
    });
    return unsubscribe;
  }, []);

  // Subscribe to active chat open state to hide bottom tab bar during active 1-on-1 chat
  useEffect(() => {
    const unsubscribe = activeChatTracker.subscribe(() => {
      setIsChatOpen(activeChatTracker.isChatOpen);
    });
    return unsubscribe;
  }, []);

  // 2. Synchronize route segment or query params to active tab
  useEffect(() => {
    const tabParam = typeof params.tab === "string" ? params.tab.toLowerCase() : undefined;
    const currentSegment = segments[1] as string | undefined;

    if (tabParam === "profile" || currentSegment === "profile" || pathname.includes("/profile")) {
      setActiveTab(4);
    } else if (tabParam === "notifications" || currentSegment === "notifications" || pathname.includes("/notifications")) {
      setActiveTab(3);
    } else if (tabParam === "messages" || currentSegment === "messages" || pathname.includes("/messages")) {
      setActiveTab(2);
    } else if (tabParam === "search" || currentSegment === "search" || pathname.includes("/search")) {
      setActiveTab(1);
    } else if (tabParam === "home" || (currentSegment === "index" && !pathname.includes("/profile"))) {
      setActiveTab(0);
    }
  }, [segments, pathname, params.tab]);

  const unreadCount = conversations.reduce((acc: number, conv: any) => {
    return acc + (conv.unreadCount || (conv.unreadBy?.includes(currentUser?.clerkId) ? 1 : 0));
  }, 0);

  const unreadNotificationsCount = notifications.filter((n: any) => !n.read).length;

  const TAB_ITEMS: TabBarItem[] = [
    { name: "home", icon: "home", label: "Home" },
    { name: "search", icon: "search", label: "Search" },
    {
      name: "messages",
      icon: "mail",
      label: "Messages",
      badge: unreadCount,
    },
    {
      name: "notifications",
      icon: "bell",
      label: "Notifications",
      badge: unreadNotificationsCount,
    },
    { name: "profile", icon: "user", label: "Profile" },
  ];

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    tabNavigation.navigateToTab(index as 0 | 1 | 2 | 3 | 4);
  };

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!isSignedIn) return <Redirect href="/(auth)" />;

  const renderScreen = () => {
    switch (activeTab) {
      case 0:
        return <HomeScreen />;
      case 1:
        return <SearchScreen />;
      case 2:
        return <MessagesScreen />;
      case 3:
        return <NotificationsScreen />;
      case 4:
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      {!isChatOpen && (
        <GlassBottomTabBar
          items={TAB_ITEMS}
          activeIndex={activeTab}
          onTabPress={handleTabPress}
          tintColor="#8B5CF6"
          inactiveTintColor="#A1A1AA"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B10",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0B0B10",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TabsLayout;
