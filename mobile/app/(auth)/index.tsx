import { useSocialAuth } from "@/hooks/useSocialAuth";
import {
  ActivityIndicator,
  Image,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
export default function Index() {
  const { handleSocialAuth, isLoading } = useSocialAuth();
  return (
    <View className="flex-1 bg-dark-bg">
      <View className="flex-1 px-8 justify-between">
        <View className="flex-1 justify-center">
          {/* demo image */}
          <View className=" items-center">
            <Image
              source={require("../../assets/images/auth1.png")}
              className="size-96"
              resizeMode="contain"
            />
          </View>

          <View className="flex-col gap-3">
            {/* Google Icon  */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-glass-light border border-border-glass-medium rounded-2xl py-3 px-6"
              onPress={() => handleSocialAuth("oauth_google")}
              disabled={isLoading}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#0A84FF" />
              ) : (
                <View className="flex-row items-center justify-center">
                  <Image
                    source={require("../../assets/images/google.png")}
                    className="size-12 mr-3"
                    resizeMode="contain"
                  />
                  <Text className="text-text-primary font-bold text-base">
                    {" "}
                    Continue With Google{" "}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Apple Icon */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-glass-light border border-border-glass-medium rounded-2xl py-3 px-6"
              onPress={() => handleSocialAuth("oauth_apple")}
              disabled={isLoading}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#0A84FF" />
              ) : (
                <View className="flex-row items-center justify-center">
                  <Image
                    source={require("../../assets/images/apple.png")}
                    className="size-8 mr-3"
                    resizeMode="contain"
                  />
                  <Text className="text-text-primary font-bold text-base">
                    {" "}
                    Continue With Apple{" "}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          {/* Terms and Privacy */}
          <Text className="text-center text-text-tertiary text-xs leading-5 mt-8 px-2">
            By signing up, you agree to our{" "}
            <Text className="text-accent-blue">Terms</Text>
            {","}
            <Text className="text-accent-blue"> Privacy Policy</Text>
            {", and "}
            <Text className="text-accent-blue"> Cookie Use</Text>.
          </Text>
        </View>
      </View>
    </View>
  );
}
