import React from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { GlassBottomTabBar, TabBarItem } from "./GlassBottomTabBar";
import { useGlassTabBar } from "@/hooks/useGlassTabBar";
import { Feather } from "@expo/vector-icons";

/**
 * GlassBottomTabBarExample
 *
 * Complete implementation example showing:
 * - GlassBottomTabBar floating navigation
 * - Tab state management with hook
 * - Content switching between tabs
 * - Proper spacing for floating tab bar
 * - Badge support
 * - Glowing active indicator
 */

interface TabContent {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const TAB_ITEMS: TabBarItem[] = [
  { name: "home", icon: "home", label: "Home" },
  { name: "explore", icon: "compass", label: "Explore" },
  { name: "create", icon: "plus-circle", label: "Create" },
  { name: "messages", icon: "message-circle", label: "Messages", badge: 3 },
  { name: "profile", icon: "user", label: "Profile" },
];

const HOME_CONTENT: TabContent[] = [
  {
    id: "1",
    title: "Welcome Home",
    description: "Your personalized feed starts here",
    icon: "home",
  },
  {
    id: "2",
    title: "Trending Now",
    description: "Popular content from your network",
    icon: "trending-up",
  },
  {
    id: "3",
    title: "Following",
    description: "Updates from accounts you follow",
    icon: "heart",
  },
];

const EXPLORE_CONTENT: TabContent[] = [
  {
    id: "1",
    title: "Discover",
    description: "Explore new content and creators",
    icon: "compass",
  },
  {
    id: "2",
    title: "Categories",
    description: "Browse by interest",
    icon: "grid",
  },
  {
    id: "3",
    title: "Search",
    description: "Find anything you want",
    icon: "search",
  },
];

const renderContentCard = (item: TabContent) => (
  <TouchableOpacity style={styles.contentCard}>
    <View style={styles.cardGradient}>
      <View style={styles.cardIcon}>
        <Feather name={item.icon as any} size={32} color="#FF3B30" />
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
    </View>
  </TouchableOpacity>
);

export const GlassBottomTabBarExample: React.FC = () => {
  const { activeTab, onTabPress } = useGlassTabBar({
    initialIndex: 0,
    onTabChange: (index) => {
      console.log(`Switched to tab: ${index}`);
    },
  });

  const getTabContent = () => {
    switch (activeTab) {
      case 0:
        return {
          title: "Home",
          subtitle: "Your feed",
          content: HOME_CONTENT,
        };
      case 1:
        return {
          title: "Explore",
          subtitle: "Discover new",
          content: EXPLORE_CONTENT,
        };
      case 2:
        return {
          title: "Create",
          subtitle: "Make something",
          content: HOME_CONTENT,
        };
      case 3:
        return {
          title: "Messages",
          subtitle: "Your conversations",
          content: HOME_CONTENT,
        };
      case 4:
        return {
          title: "Profile",
          subtitle: "Your account",
          content: HOME_CONTENT,
        };
      default:
        return {
          title: "Home",
          subtitle: "Your feed",
          content: HOME_CONTENT,
        };
    }
  };

  const tabContent = getTabContent();

  return (
    <View style={styles.container}>
      {/* Dark Gradient Background */}
      <View style={styles.background} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{tabContent.title}</Text>
          <Text style={styles.headerSubtitle}>{tabContent.subtitle}</Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <FlatList
            data={tabContent.content}
            renderItem={({ item }) => renderContentCard(item)}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

          {/* Bottom Spacer for Floating Tab Bar */}
          <View style={styles.tabBarSpacer} />
        </ScrollView>
      </SafeAreaView>

      {/* Glass Bottom Tab Bar */}
      <GlassBottomTabBar
        items={TAB_ITEMS}
        activeIndex={activeTab}
        onTabPress={onTabPress}
        tintColor="#FF3B30"
        inactiveTintColor="rgba(255, 255, 255, 0.6)"
        blurIntensity={98}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0a0a0a",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 20,
  },
  contentCard: {
    marginVertical: 8,
  },
  cardGradient: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },
  separator: {
    height: 8,
  },
  tabBarSpacer: {
    height: 40,
  },
});
