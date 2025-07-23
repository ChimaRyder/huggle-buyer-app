import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { useTheme, Layout } from "@ui-kitten/components";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const SplashScreen = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  // Animation setup
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    // Start the pulsating animation
    scale.value = withRepeat(
      withTiming(1.2, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // Infinite repeat
      true // Reverse
    );

    // Set a timeout to check user and redirect after 3 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // If loading is complete, redirect based on user status
  if (!isLoading) {
    if (user) {
      return <Redirect href="/(auth)" />;
    }
    return <Redirect href="/(login)" />;
  }

  return (
    <Layout
      style={[styles.container, { backgroundColor: "color-primary-500" }]}
    >
      <Animated.View style={animatedStyle}></Animated.View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SplashScreen;
