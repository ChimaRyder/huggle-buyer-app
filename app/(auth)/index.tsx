import React, { useEffect, useState } from "react";
import { Alert, View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { Text, Spinner, useTheme, Layout } from "@ui-kitten/components"; // Changed from react-native-svg for proper Text component
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { CreateBuyerAccount } from "../../utils/user";
import { registerForPushNotificationsAsync } from "@/utils/Notifications";
import { addPushToken } from "@/utils/pushToken";
import { ShoppingBag } from "lucide-react-native";
import { useApi } from "@/context/ApiContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { template } from "@babel/core";

export default function AuthScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Checking user information...");
  const theme = useTheme();
  const { getToken } = useAuth();
  const { client: apiClient } = useApi();

  const registerAndFetchToken = async () => {
    try {
      const pToken = await registerForPushNotificationsAsync();
      
      if (user && pToken) {
        const response = await addPushToken(apiClient, { token: pToken });
        
        if (response.success) {
          // Store the token ID for later deactivation
          if (response.data && response.data.data && response.data.data.id) {
            await AsyncStorage.setItem('pushTokenId', response.data.data.id);
          }
        } else {
          console.error('❌ AuthScreen: Failed to register push token:', response.error);
        }
      } else {
      }
    } catch (error) {
      console.error('❌ AuthScreen: Error in push token registration:', error);
    }
  };

  // Animation setup
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (user) {
        try {
          setStatus("Checking user profile...");
          const exists = await checkIfUserExists(user.id);
          setStatus("Redirecting...");
          if (exists === 200) {
            await registerAndFetchToken();
            setTimeout(() => {
              router.dismissTo("/(tabs)");
            }, 500); // Small delay for smoother transition
          } else if (exists === 404) {
            const token = await getToken({template: "seller_app"});
            await CreateBuyerAccount(
              token,
              user.id,
              user.firstName + " " + user.lastName,
              user.emailAddresses[0].emailAddress
            );
            await registerAndFetchToken();
            router.dismissTo("/(tabs)");
            // Create account here
          }
        } catch (error) {
          setStatus("Something went wrong");
          console.error("Error in user redirection flow:", error);
          setTimeout(() => setLoading(false), 1000);
        }
      } else {
        setStatus("Waiting for user information...");
        // If no user after 3 seconds, we might have a problem
        setTimeout(() => {
          if (!user) {
            setLoading(false);
            setStatus("No user found. Please sign in again.");
          }
        }, 3000);
      }
    };

    checkUserAndRedirect();
  }, [user, router]);

  useEffect(() => {
    // Start the pulsating animation
    scale.value = withRepeat(
      withTiming(1.2, {
        duration: 500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // Infinite repeat
      true // Reverse
    );
  }, []);

  const checkIfUserExists = async (userid: string) => {
    try {
      setStatus("Connecting to server...");

      const hasAccount = user?.publicMetadata.hasAccount;

      if (hasAccount) {
        return 200;
      } else {
        return 404;
      }
    } catch (error) {}
  };

  return (
    <Layout
      style={[
        styles.container,
        { backgroundColor: theme["color-primary-500"] },
      ]}
    >
      {loading ? (
        <>
          <Animated.View style={animatedStyle}>
            <ShoppingBag
              size={80}
              color={theme['color-basic-100']}
            />
          </Animated.View>
        </>
      ) : (
        <View style={styles.errorContainer}>
          <Text category="s1" status="control" style={styles.errorText}>
            {status}
          </Text>
          <Text
            category="h6"
            status="control"
            style={styles.linkText}
            onPress={() => router.replace("/")}
          >
            Return to Login
          </Text>
        </View>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
  },
  errorContainer: {
    alignItems: "center",
  },
  errorText: {
    textAlign: "center",
    marginBottom: 20,
  },
  linkText: {
    textDecorationLine: "underline",
    marginTop: 20,
  },
});
