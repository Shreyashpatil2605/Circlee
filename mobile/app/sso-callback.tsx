import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
export default function SSOCallback() {
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" />
  </View>;
  return <Redirect href={"/(tabs)"} />;
}
