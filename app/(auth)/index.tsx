import React, { useEffect, useState } from "react";
import { Alert, View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useClerk } from "@clerk/clerk-expo";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Text } from "react-native";
import axios from "axios";

export default function AuthScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Checking user information...");
  const { getToken } = useAuth();

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
        const exists = await checkIfUserExists();
        console.log(exists);

        if (exists === 200) {
          router.dismissTo("/(tabs)");
        } else if (exists === 404) {
          createBuyerAccount();
          router.dismissTo("/(tabs)");
        }
      } else {
        router.dismissTo("../(login)");
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

  const createBuyerAccount = async () => {
    const data = {
      id: user?.id,
      name: user?.firstName + " " + user?.lastName,
      emailAddress: user?.primaryEmailAddress?.emailAddress,
    };
    console.log(data);
    try {
      const token = await getToken();
      console.log("Bearer " + token);
      const response = await axios.post(
        `https://huggle-backend-jh2l.onrender.com/api/buyers`,
        {
          ...data,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const checkIfUserExists = async () => {
    try {
      const hasAccount = user?.publicMetadata?.hasAccount;
      if (hasAccount) {
        return 200;
      } else {
        return 404;
      }
    } catch (error) {}
  };

  return (
    <>
      <Text>Yawa</Text>
    </>
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
