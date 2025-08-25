import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { getUnreadNotificationCount } from "../../utils/notificationApi";
import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

const getGreetingTime = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
};

interface GreeterSectionProps {
  onLocationPress?: () => void;
}

const GreeterSection: React.FC<GreeterSectionProps> = ({ onLocationPress }) => {
  const [location, setLocation] = useState<string>("Fetching location...");
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    let mounted = true;
    async function fetchUnread() {
      if (!user) return;
      try {
        const token = await getToken({ template: "seller_app" });
        const res = await getUnreadNotificationCount(user.id, token);
        if (mounted) setUnreadCount(Number(res.unreadCount) || 0);
      } catch {
        if (mounted) setUnreadCount(0);
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000); // poll every 10s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user, getToken]);

  // Fetch and display the last pinned location from AsyncStorage if available
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      (async () => {
        try {
          const stored = await AsyncStorage.getItem("userLocation");
          if (stored) {
            const coords = JSON.parse(stored);
            // Reverse geocode the pinned coordinates
            const address = await Location.reverseGeocodeAsync(coords);
            if (address.length > 0) {
              const {
                name,
                street,
                district,
                subregion,
                city,
                region,
                country,
              } = address[0];
              const parts = [
                name,
                street,
                district,
                subregion,
                city,
                region,
                country,
              ]
                .filter(Boolean)
                .slice(0, 3);
              if (isActive) setLocation(parts.join(", "));
            } else {
              if (isActive) setLocation("Unknown pinned location");
            }
          } else {
            // Fallback to device location
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
              if (isActive) setLocation("Location permission denied");
              return;
            }
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            });
            const address = await Location.reverseGeocodeAsync(loc.coords);
            if (address.length > 0) {
              const {
                name,
                street,
                district,
                subregion,
                city,
                region,
                country,
              } = address[0];
              const parts = [
                name,
                street,
                district,
                subregion,
                city,
                region,
                country,
              ]
                .filter(Boolean)
                .slice(0, 3);
              if (isActive) setLocation(parts.join(", "));
            } else {
              if (isActive) setLocation("Unknown location");
            }
          }
        } catch (error) {
          console.error("Error getting location:", error);
          if (isActive) setLocation("Failed to fetch location");
        }
      })();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const NotificationBell = ({ unreadCount }: { unreadCount: number }) => {
    const router = useRouter();
    return (
      <TouchableOpacity
        onPress={() => router.push("/(screens)/NotificationScreen")}
        style={{ position: "relative" }}
        activeOpacity={0.7}
      >
        <View style={styles.notificationIconContainer}>
          <Ionicons 
            name="notifications" 
            size={24} 
            color={colors.icon.primary} 
          />
        </View>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.leftColumn}>
          {/* User avatar, greeting, and location in one row */}
          <View style={styles.userRow}>
            <View style={styles.avatarContainer}>
              <Ionicons 
                name="person-circle" 
                size={40} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.greetingText}>
                {getGreetingTime()}, {user?.firstName || "there"}!
              </Text>
              {onLocationPress ? (
                <TouchableOpacity
                  style={styles.locationRow}
                  onPress={onLocationPress}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="location" 
                    size={16} 
                    color={colors.icon.secondary} 
                    style={styles.locationIcon}
                  />
                  <Text
                    style={[
                      styles.locationText,
                      { textDecorationLine: "underline", color: colors.text.secondary },
                    ]}
                  >
                    {location}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.locationRow}>
                  <Ionicons 
                    name="location" 
                    size={16} 
                    color={colors.icon.secondary} 
                    style={styles.locationIcon}
                  />
                  <Text style={[styles.locationText, { color: colors.text.secondary }]}>
                    {location}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <NotificationBell unreadCount={unreadCount} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    marginBottom: 8,
  },
  row: {
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftColumn: {
    flex: 1,
    marginRight: 20,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: colors.text.primary,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: {
    marginRight: 4,
  },
  locationText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  notificationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.border.primary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  badgeText: {
    color: colors.text.inverse,
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 3,
  },
});

export default GreeterSection;
