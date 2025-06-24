import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Layout, Text, Icon, useTheme } from "@ui-kitten/components";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

export default function AuthScreen() {
  const { isLoaded, isSignedIn, user } = useUser(); // ✅ safer destructuring
  const router = useRouter();
  const theme = useTheme();

  const [status, setStatus] = useState("Checking user info...");

  // Animation setup
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.2, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (!isLoaded) return; // ⛔ Wait for Clerk to finish loading

    if (isSignedIn && user) {
      setStatus("User found. Redirecting...");
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 600);
    } else {
      setStatus("No user found. Redirecting to login...");
      setTimeout(() => {
        router.replace("/(login)");
      }, 600);
    }
  }, [isLoaded, isSignedIn]);

  return (
    <Layout style={[styles.container, { backgroundColor: theme["color-primary-500"] }]}>
      <Animated.View style={animatedStyle}>
        <Icon
          name="shopping-bag-outline"
          style={{ width: 70, height: 70 }}
          fill={theme["color-basic-100"]}
        />
      </Animated.View>
      <Text category="s1" status="control" style={styles.text}>
        {status}
      </Text>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 20,
    textAlign: "center",
  },
});
