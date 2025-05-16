import React, { useState, useRef, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  View,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import * as eva from "@eva-design/eva";
import {
  ApplicationProvider,
  Layout,
  Text,
  Button,
  Icon,
  IconProps,
  IconElement,
} from "@ui-kitten/components";
import { ClerkAPIError } from "@clerk/types";
import { Redirect } from "expo-router";

import * as WebBrowser from "expo-web-browser";
import { isClerkAPIResponseError, useSSO } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import { useUser } from "@clerk/clerk-expo";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

const FacebookIcon = () => null;
const GoogleIcon = () => null;

export default function WelcomeScreen() {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();
  const [errors, setErrors] = useState<ClerkAPIError[]>([]);
  const router = useRouter();
  const { user } = useUser();

  // Check if user is already signed in
  if (user) {
    console.log("User is already signed in");
    return <Redirect href="/(app)" />;
  }

  // Handle Google Login Response
  const handleFacebookLogin = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_facebook",
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: "myapp",
          path: "(app)",
        }),
      });
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        router.replace("/(app)");
      } else {
        console.log("User is not signed in after Facebook SSO");
      }
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        setErrors(error.errors);
        error.errors.forEach((err) => {
          Alert.alert("Authentication Error", err.message);
        });
        console.log("Clerk API error during Facebook login", error.errors);
      } else {
        Alert.alert(
          "Authentication Error",
          "An unexpected error occurred. Please try again."
        );
        console.error(error);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: "myapp",
          path: "/(app)",
        }),
      });
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        router.replace("/(app)");
      }
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        setErrors(error.errors);
        error.errors.forEach((err) => {
          Alert.alert("Authentication Error", err.message);
        });
        console.log("Clerk API error during Google login", error.errors);
      } else {
        Alert.alert(
          "Authentication Error",
          "An unexpected error occurred. Please try again."
        );
        console.error(error);
      }
    }
  };

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <View style={styles.overlay} />
      <Layout style={styles.container}>
        <View style={styles.contentContainer}>
          <Text style={styles.headline}>Good Vibes. Great Finds.</Text>
          <Text style={styles.subtext}>
            Find the best deals for the best meals.
          </Text>
          {errors.map((error) => (
            <Text key={error.code} status="danger">
              {error.message}
            </Text>
          ))}

          <View style={styles.buttonContainer}>
            <Button
              style={styles.facebookButton}
              accessoryLeft={FacebookIcon}
              onPress={handleFacebookLogin}
            >
              Continue with Facebook
            </Button>

            <Button
              style={styles.googleButton}
              status="basic"
              accessoryLeft={GoogleIcon}
              onPress={handleGoogleLogin}
            >
              Continue with Google
            </Button>
          </View>

          <Text style={styles.termsText}>
            By signing up, you agree to our Terms and Conditions.
          </Text>
        </View>
      </Layout>
    </ApplicationProvider>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,29,36,0.6)",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 20,
    paddingBottom: 50,
  },
  headline: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    textAlign: "left",
    marginBottom: 10,
  },
  subtext: {
    fontSize: 18,
    fontWeight: "200",
    color: "white",
    textAlign: "left",
    marginBottom: 70,
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 30,
  },
  facebookButton: {
    backgroundColor: "#3b5998",
    borderColor: "#3b5998",
  },
  googleButton: {
    backgroundColor: "white",
    borderColor: "#051D24",
  },
  termsText: {
    fontSize: 14,
    fontWeight: "400",
    color: "white",
    textAlign: "center",
    marginTop: 10,
  },
});
