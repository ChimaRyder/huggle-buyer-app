import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {Home, LayoutGrid, MessageCircle, User } from 'lucide-react-native';

import { colors } from "@/constants/theme";
import FloatingCartButton from "@/components/cart/FloatingCartButton";

export default function TabLayout() {
  // Use produce-themed colors for the tab bar
  const activeTintColor = colors.primary.main; // Green color for produce theme
  const inactiveTintColor = colors.text.tertiary; // Light gray for inactive

  return (
    <View style={{ flex: 1 }}>
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
            <Home color={color} size={25}/>          
          ),
        }}
      />
      <Tabs.Screen
        name="DiscoverScreen"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, focused }) => (
            <LayoutGrid color={color} size={25}/>
          ),
        }}
      />
      <Tabs.Screen
        name="ChatListScreen"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <MessageCircle color={color} size={25}/>
          ),
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <User color={color} size={25}/>
          ),
        }}
      />
      </Tabs>
      <FloatingCartButton />
    </View>
  );
}
