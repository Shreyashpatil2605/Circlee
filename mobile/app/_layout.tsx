import { ClerkProvider } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import "../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryclient = new QueryClient();

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <QueryClientProvider client={queryclient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)"/>
        </Stack>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
