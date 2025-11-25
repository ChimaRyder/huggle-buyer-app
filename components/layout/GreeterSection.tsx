import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { getUnreadNotificationCount } from "../../utils/notificationApi";
import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { GreetingSearchBox } from "@/components/home";
import { useLocationContext, SavedLocation } from "@/context/LocationContext";

const screenWidth = Dimensions.get("window").width;

const getGreetingTime = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
};

interface GreeterSectionProps {
  onLocationPress?: () => void;
  onSearchFocus?: () => void;
}

const GreeterSection: React.FC<GreeterSectionProps> = ({ onLocationPress, onSearchFocus }) => {
  const [displayLocation, setDisplayLocation] = useState<string>("Fetching location...");
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useUser();
  const { getToken } = useAuth();
  const { currentLocation, savedLocations, getLocationAddress, initializeLocationInBackground, setLocation } = useLocationContext();

  // Helper function to truncate location text to 25 characters
  const truncateLocation = (text: string, maxLength: number = 25): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  // Initialize location in background on mount
  useEffect(() => {
    initializeLocationInBackground();
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchUnread() {
      if (!user) return;
      try {
        const token = await getToken({ template: "seller_app" });
        const res = await getUnreadNotificationCount(user.id, token);
        console.log('🔔 Buyer app received notification count response:', JSON.stringify(res));
        const count = Number(res.data?.UnreadCount || res.data?.unreadCount || res.UnreadCount || res.unreadCount) || 0;
        console.log('🔔 Buyer app parsed count:', count);
        if (mounted) setUnreadCount(count);
      } catch (error) {
        console.error('🔔 Buyer app failed to fetch unread count:', error);
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


  // Update display location when currentLocation from context changes
  useEffect(() => {
    const updateDisplayLocation = async () => {
      try {
        if (currentLocation) {
          // Use the improved getLocationAddress method from context
          const address = await getLocationAddress(currentLocation);
          const truncatedLocation = truncateLocation(address);
          setDisplayLocation(truncatedLocation);
        } else {
          // Fallback to device location if no location is selected in context
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            setDisplayLocation(truncateLocation("Location access denied"));
            return;
          }
          
          setDisplayLocation(truncateLocation("Getting location..."));
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            maximumAge: 300000, // 5 minutes
            timeout: 10000,
          });
          
          const deviceLocation = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
          
          const address = await getLocationAddress(deviceLocation);
          const deviceLocationWithAddress = { ...deviceLocation, address };
          
          // Automatically save the device location to context so products can load
          try {
            await setLocation(deviceLocationWithAddress);
            console.log('✅ GreeterSection: Automatically saved device location to context');
          } catch (error) {
            console.warn('⚠️ GreeterSection: Failed to save device location to context:', error);
          }
          
          const truncatedLocation = truncateLocation(address);
          setDisplayLocation(truncatedLocation);
        }
      } catch (error) {
        console.error("Error getting location:", error);
        setDisplayLocation(truncateLocation("Unable to get location"));
      }
    };

    updateDisplayLocation();
  }, [currentLocation, getLocationAddress]);

  const NotificationBell = ({ unreadCount }: { unreadCount: number }) => {
    const router = useRouter();
    return (
      <TouchableOpacity
        onPress={() => router.push("/(screens)/home/NotificationScreen")}
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

  const timeOfDay = getGreetingTime();
  const greetingText = `Good ${timeOfDay}, ${user?.firstName || "there"}!`;

  return (
    <View style={styles.container}>
      {/* Header with Location and Notification icon */}
      <View style={styles.headerRow}>
        <View style={styles.locationContainer}>
          <Ionicons 
            name="location" 
            size={24} 
            color={colors.icon.primary} 
            style={styles.locationIcon}
          />
          {onLocationPress ? (
            <TouchableOpacity
              onPress={onLocationPress}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.locationText,
                  { color: colors.text.tertiary },
                ]}
              >
                {displayLocation}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.locationText, { color: colors.text.tertiary }]}>
              {displayLocation}
            </Text>
          )}
        </View>
        <NotificationBell unreadCount={unreadCount} />
      </View>
      
      {/* Greeting and Search Bar Box */}
      <GreetingSearchBox 
        greeting={greetingText} 
        timeOfDay={timeOfDay}
        onFocus={onSearchFocus || (() => {})} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  headerRow: {
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "flex-end",

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
    alignItems: "center",
    justifyContent: "center",
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
