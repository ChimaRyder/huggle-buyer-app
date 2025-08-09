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
import Constants from "expo-constants";

import { registerForPushNotificationsAsync } from "@/utils/Notifications";
import { StyleSheet, SafeAreaView } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from 'react-native-toast-message';
import mainTheme from '@/assets/themes/main-theme.json'

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
        <SafeAreaView style={styles.container}>
          <ApplicationProvider
            {...eva}
            theme={{...eva.light,...mainTheme}}
          >
            <ThemeProvider
              value={DefaultTheme}
            >
              <Slot />
              <StatusBar style="auto" />
            </ThemeProvider>
          </ApplicationProvider>
        </SafeAreaView>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F7F8FA", //F7F8FA
    marginTop: 24,
    flex: 1,
  },
});
