import React, { useEffect, useState } from "react";
import { StyleSheet, BackHandler } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { useTheme, Layout, Text } from "@ui-kitten/components";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { ShoppingBag } from "lucide-react-native";

const SplashScreen = () => {
  const { user, isLoaded } = useUser();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  // Animation setup
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    // Handle Android back button during splash - prevent going back
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // Return true to prevent default back behavior during splash
        return true;
      }
    );

    // Start the pulsating animation
    scale.value = withRepeat(
      withTiming(1.2, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // Infinite repeat
      true // Reverse
    );

    // Wait for Clerk to load and show splash for minimum 2 seconds
    const timer = setTimeout(() => {
      if (isLoaded) {
        setIsLoading(false);
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
      backHandler.remove();
    };
  }, [isLoaded]);

  // If Clerk is loaded but splash is still showing, dismiss it once ready
  useEffect(() => {
    if (isLoaded && !isLoading) {
      // Ready to redirect
    }
  }, [isLoaded, isLoading]);

  // If loading is complete, redirect based on user status
  if (!isLoading && isLoaded) {
    if (user) {
      return <Redirect href="/(auth)" />;
    }
    return <Redirect href="/(login)" />;
  }

  return (
    <Layout
      style={
        [styles.container, 
          { backgroundColor: theme["color-primary-500"] },
        ]}
    >
      <Animated.View style={animatedStyle}>
        <ShoppingBag
          size={80}
          color={theme['color-basic-100']}
        />
      </Animated.View>
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
