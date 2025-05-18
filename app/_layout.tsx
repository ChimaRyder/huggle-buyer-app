import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';



import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <ApplicationProvider {...eva} theme={colorScheme === 'dark' ? eva.dark : eva.light}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(screens)/ProductScreen" options={{ headerShown: false }} />
            <Stack.Screen name="(screens)/StoreHomepageScreen" options={{ headerShown: false }} />
            <Stack.Screen name="(screens)/cart" options={{ headerShown: false }} />
            <Stack.Screen name="(screens)/chat" options={{ headerShown: false }} />
            <Stack.Screen name="(screens)/reviews" options={{ headerShown: false }} />
            <Stack.Screen name="(screens)/Orders" options={{ headerShown: false }} />
            <Stack.Screen name="(screens)/OrderDetails" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </ApplicationProvider>
    </>
  );
}
