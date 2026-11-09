import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSocialAuth } from "@/hooks/useSocialAuth";
import { FontAwesome5 } from "@expo/vector-icons";

const authHeroImage = require("../../assets/images/auth-hero.png");
const circleeSymbol = require("../../assets/images/circlee-symbol.png");

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const { handleSocialAuth, isLoading } = useSocialAuth();

  // Dynamic responsive sizing for the hero illustration card
  const heroCardHeight = Math.min(Math.max(screenHeight * 0.29, 200), 260);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, Platform.OS === "android" ? 20 : 44) + 12,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* 1. Header: Circlee Logo Squircle + Wordmark + Tagline */}
        <View style={styles.headerContainer}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Image
                source={circleeSymbol}
                style={styles.logoBadgeImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.brandTitle}>Circlee</Text>
          </View>
          <Text style={styles.brandSubtitle}>The CIRCLEE. Connecting to People.</Text>
        </View>

        {/* 2. Hero 3D Illustration Card */}
        <View style={[styles.heroCard, { height: heroCardHeight }]}>
          <Image
            source={authHeroImage}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* 3. Text Section: Find Your People */}
        <View style={styles.textSection}>
          <Text style={styles.headline}>Find Your People.</Text>
          <Text style={styles.subheadline}>
            Share moments, discover people and build meaningful connections.
          </Text>
        </View>

        {/* 4. Action Buttons */}
        <View style={styles.actionsSection}>
          {/* Continue with Google */}
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => handleSocialAuth("oauth_google")}
            disabled={isLoading}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#A78BFA" />
            ) : (
              <View style={styles.buttonContent}>
                <FontAwesome5
                  name="google"
                  size={17}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Continue with Google</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Continue with Apple */}
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => handleSocialAuth("oauth_apple")}
            disabled={isLoading}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Continue with Apple"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#A78BFA" />
            ) : (
              <View style={styles.buttonContent}>
                <FontAwesome5
                  name="apple"
                  size={19}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Continue with Apple</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 5. Footer Terms & Privacy */}
        <View style={styles.footerContainer}>
          <Text style={styles.disclaimerText}>
            By continuing, you agree to our Terms, Privacy Policy and Cookie Use.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#08080C",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#0D0014",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  logoBadgeImage: {
    width: 25,
    height: 25,
  },
  brandTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  brandSubtitle: {
    color: "#A78BFA",
    fontSize: 11.5,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 6,
    letterSpacing: 0.2,
  },
  heroCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 8,
    marginVertical: 12,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  textSection: {
    alignItems: "center",
    paddingHorizontal: 12,
    marginVertical: 6,
  },
  headline: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subheadline: {
    color: "#94A3B8",
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 7,
  },
  actionsSection: {
    width: "100%",
    gap: 12,
    marginVertical: 10,
  },
  authButton: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    backgroundColor: "#14141E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.10)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  footerContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 4,
  },
  disclaimerText: {
    color: "#64748B",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
});
