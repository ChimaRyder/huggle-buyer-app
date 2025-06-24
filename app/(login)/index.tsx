import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ImageBackground,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { ClerkAPIError } from "@clerk/types";
import { useUser } from "@clerk/clerk-expo";
import { useClerk } from "@clerk/clerk-expo";
import { isClerkAPIResponseError, useSSO } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

// Initialize WebBrowser for auth
WebBrowser.maybeCompleteAuthSession();

export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

export default function LoginScreen() {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();
  const [errors, setErrors] = useState<ClerkAPIError[]>([]);
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();

  // Check if user is already signed in
  useEffect(() => {
    if (user) {
      router.replace("/(auth)");
    }
  }, [user]);

  // Handle Google login
  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: "myapp",
          path: "(app)",
        }),
      });

      if (createdSessionId && setActive) {
        setActive({ session: createdSessionId });
        router.replace("/(auth)");
      }
    } catch (error) {
      handleAuthError(error);
    }
  };

  // Handle Facebook login
  const handleFacebookSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_facebook",
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: "myapp",
          path: "(app)",
        }),
      });

      if (createdSessionId && setActive) {
        setActive({ session: createdSessionId });
        router.replace("/(auth)");
      }
    } catch (error) {
      handleAuthError(error);
    }
  };

  // Error handling helper
  const handleAuthError = (error: unknown) => {
    if (isClerkAPIResponseError(error)) {
      setErrors(error.errors);
      console.log("Auth error:", error.errors);
    } else {
      console.error("Unexpected error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../../assets/images/welcome-screen-background.jpg")}
        style={styles.backgroundImage}
      >
        <View style={styles.overlay} />

        <View style={styles.contentContainer}>
          {/* Headline Area */}
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>Good Vibes. Great Finds.</Text>
            <Text style={styles.subheadline}>
              Find the best deals for the best meals.
            </Text>
          </View>

          {/* Error messages */}
          {errors.length > 0 && (
            <View style={styles.errorContainer}>
              {errors.map((error) => (
                <Text key={error.code} style={styles.errorText}>
                  {error.message}
                </Text>
              ))}
            </View>
          )}

          {/* Auth Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                {/* Google icon placeholder */}
                <View style={styles.iconPlaceholder} />
                <Text style={styles.googleButtonText}>Sign in With Google</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.facebookButton}
              onPress={handleFacebookSignIn}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                {/* Facebook icon placeholder */}
                <View style={styles.iconPlaceholder} />
                <Text style={styles.facebookButtonText}>
                  Sign in With Facebook
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headlineContainer: {
    marginBottom: 40,
  },
  headline: {
    fontSize: 32,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    lineHeight: 38,
  },
  subheadline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 22,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconPlaceholder: {
    width: 24,
    height: 24,
    marginRight: 12,
    // You'll replace this with your actual icon
    backgroundColor: "transparent",
  },
  googleButton: {
    backgroundColor: "white",
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonText: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "500",
  },
  facebookButton: {
    backgroundColor: "#1877F2",
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  facebookButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  errorContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    borderRadius: 4,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
  },
});
