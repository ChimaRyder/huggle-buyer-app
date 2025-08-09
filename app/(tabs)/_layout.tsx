import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser, useAuth } from "@clerk/clerk-expo";

import HapticTab from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { getUnreadNotificationCount } from "../../utils/notificationApi";

function NotificationTabIcon({ color }: { color: string }) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function fetchUnread() {
      if (!user) return;
      try {
        const token = await getToken({ template: "seller_app" });
        const res = await getUnreadNotificationCount(user.id, token);
        if (mounted) setUnread(Number(res.unreadCount) || 0);
      } catch {
        if (mounted) setUnread(0);
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000); // poll every 10s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user, getToken]);

  return (
    <View>
      <Ionicons name="notifications" size={28} color={color} />
      {unread > 0 && (
        <View
          style={{
            position: "absolute",
            right: -2,
            top: -2,
            backgroundColor: "#d00",
            borderRadius: 8,
            minWidth: 16,
            height: 16,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 3,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>
            {unread}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index" // this becomes your Home screen
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="SearchScreen"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="FavoritesScreen"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="NotificationScreen"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color }) => <NotificationTabIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
