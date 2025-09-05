import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/constants/theme";

export default function TabLayout() {
  // Use produce-themed colors for the tab bar
  const activeTintColor = colors.primary; // Green color for produce theme
  const inactiveTintColor = colors.text.tertiary; // Light gray for inactive

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTintColor,
        tabBarInactiveTintColor: inactiveTintColor,
        headerShown: false,
        tabBarShowLabel: false, // Hide labels, show only icons
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            backgroundColor: colors.background.primary,
            borderTopColor: colors.border.primary,
            height: 80, // Increased height
            paddingBottom: 10, // Added padding at bottom
            paddingTop: 10, // Added padding at top
          },
          default: {
            backgroundColor: colors.background.primary,
            borderTopColor: colors.border.primary,
            height: 80, // Increased height
            paddingBottom: 10, // Added padding at bottom
            paddingTop: 10, // Added padding at top
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index" // this becomes your Home screen
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={28} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="DiscoverScreen"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "grid" : "grid-outline"} 
              size={28} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={28} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
