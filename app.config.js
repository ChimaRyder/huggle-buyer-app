import "dotenv/config";

export default {
  expo: {
    owner: "huggle",
    name: "Huggle",
    slug: "huggle-buyer-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      bundleIdentifier: "com.huggle.buyerapp",
      supportsTablet: true,
    },
    android: {
      package: "com.huggle.buyerapp",
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo.png",
        backgroundColor: "#ffffff",
      },
      permissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
      googleServicesFile: "./google-services.json",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/logo.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo.png",
          imageWidth: 1024,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-font",
      "expo-secure-store",
      "expo-web-browser",
      [
        "expo-notifications",
        {
          icon: "./assets/images/logo.png",
          color: "#ffffff",
          sounds: [],
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      eas: {
        projectId: "2e9c4bbf-eb17-4b5a-b1fb-1ec35317fa2d",
      },
    },
  },
};
