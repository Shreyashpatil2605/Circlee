import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";
import { View } from "react-native";
import "../global.css";
import ConvexUserSync from "@/components/ConvexUserSync";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const queryclient = new QueryClient();

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

function DebugAuth() {
  const { userId, isSignedIn } = useAuth();

  console.log("========== CLERK DEBUG ==========");
  console.log("SIGNED IN:", isSignedIn);
  console.log("USER ID:", userId);
  console.log("=================================");

  return null;
}

function ConvexClerkProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  return (
    <ConvexProviderWithClerk client={convex} useAuth={() => auth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

export default function RootLayout() {
  console.log("CONVEX URL:", process.env.EXPO_PUBLIC_CONVEX_URL);

  return (
    <SafeAreaProvider>
      <ClerkProvider
        tokenCache={tokenCache}
        publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      >
        <ConvexClerkProvider>
          <QueryClientProvider client={queryclient}>
            {/* DEBUG AUTH */}
            <DebugAuth />
            <ConvexUserSync />

            <View className="flex-1 bg-white">
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "#FFFFFF" },
                }}
              >
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
              </Stack>

              <StatusBar style="dark" />
            </View>
          </QueryClientProvider>
        </ConvexClerkProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}
