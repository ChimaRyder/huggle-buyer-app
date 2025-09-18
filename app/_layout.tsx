// app/_layout.tsx
import React, { useEffect } from "react";
import {
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Slot } from "expo-router";
import * as eva from "@eva-design/eva";
import { ApplicationProvider } from "@ui-kitten/components";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "../utils/cache";

import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import mainTheme from '@/assets/themes/main-theme.json'
import { CartProvider } from "@/context/CartContext";
import { AppProvider } from "@/components/AppProvider";

SplashScreen.preventAutoHideAsync();

// Get publishable key from environment variable
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider
        publishableKey={publishableKey || ""}
        tokenCache={tokenCache}
      >
        <AppProvider>
          <CartProvider>
            <ApplicationProvider
              {...eva}
              theme={{...eva.light, ...mainTheme}}
            >
              <ThemeProvider
                value={DefaultTheme}
              >
                <Slot />
                <StatusBar style="light" backgroundColor="#4CAF50" />
              </ThemeProvider>
            </ApplicationProvider>
          </CartProvider>
        </AppProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    flex: 1,
  },
});
