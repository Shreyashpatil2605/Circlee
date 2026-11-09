import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { introSession } from "@/utils/introSession";
import { View, ActivityIndicator } from "react-native";

export default function AppEntry() {
  const { isLoaded, isSignedIn } = useAuth();

  // 1. Play cinematic animated intro once per application launch
  if (!introSession.hasPlayed()) {
    return <Redirect href="/intro" />;
  }

  // 2. Wait for Clerk authentication state to resolve
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000000", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  // 3. Navigate to main tabs or auth welcome screen
  return isSignedIn ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)" />;
}
