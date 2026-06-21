import { Redirect } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { GlassBottomTabBar, TabBarItem } from "@/components/GlassBottomTabBar";
import HomeScreen from "./index";
import SearchScreen from "./search";
import MessagesScreen from "./messages";
import NotificationsScreen from "./notifications";
import ProfileScreen from "./profile";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useConversations } from "@/hooks/useMessages";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const Tabslayout = () => {
  const { isSignedIn } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const { conversations } = useConversations();
  const { currentUser } = useCurrentUser();
  const [hasViewedMessages, setHasViewedMessages] = useState(false);
  const unreadCount = conversations.filter((conv: any) =>
    conv.unreadBy?.includes(currentUser?.clerkId),
  ).length;
  const TAB_ITEMS: TabBarItem[] = [
    { name: "home", icon: "home", label: "Home" },
    { name: "search", icon: "search", label: "Search" },
    {
      name: "messages",
      icon: "mail",
      label: "Messages",
      badge: unreadCount,
    },
    { name: "notifications", icon: "bell", label: "Notifications" },
    { name: "profile", icon: "user", label: "Profile" },
  ];
  const handleTabPress = (index: number) => {
    setActiveTab(index);

    if (index === 2) {
      setHasViewedMessages(true);
    }
  };

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
    <View style={{ flex: 1 }}>
      {renderScreen()}
      <GlassBottomTabBar
        items={TAB_ITEMS}
        activeIndex={activeTab}
        onTabPress={handleTabPress}
        tintColor="#0F172A"
        inactiveTintColor="#94A3B8"
      />
    </View>
  );
};

export default Tabslayout;
