import { Redirect, Stack } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

export default function RootLayout() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
