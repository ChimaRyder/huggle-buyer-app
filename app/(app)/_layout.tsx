import { Slot } from "expo-router";
import { Redirect } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

export default function RootLayout() {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return <Redirect href="/(auth)" />;
  }

  return <Slot />;
}
