import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { BlurView } from "expo-blur";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";

const screenWidth = Dimensions.get("window").width;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good";
  if (hour < 18) return "Good";
  return "Good";
};

const getGreetingTime = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "morning!";
  if (hour < 18) return "afternoon!";
  return "evening!";
};

interface GreeterSectionProps {
  onLocationPress?: () => void;
}

const GreeterSection: React.FC<GreeterSectionProps> = ({ onLocationPress }) => {
  const [location, setLocation] = useState<string>("Fetching location...");

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

  const NotificationBell = ({ unreadCount }) => {
    const router = useRouter();
    return (
      <TouchableOpacity
        onPress={() => router.push("/(screens)/NotificationScreen")}
        style={{ position: "relative" }}
        activeOpacity={0.7}
      >
        <Image
          source={require("../assets/icons/bell.png")}
          style={styles.notificationIcon}
        />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Move mockNotifications to a shared location or import from NotificationScreen if needed
  const mockNotifications = [
    {
      id: "1",
      type: "order",
      title: "Order Shipped!",
      message: "Your order #12345 has been shipped.",
      date: "2025-07-23 09:30",
      read: false,
    },
    {
      id: "2",
      type: "product",
      title: "New Product from Favorite Store",
      message: "Check out the new Mango Tart at Sweet Treats!",
      productId: "mango-tart-001",
      storeName: "Sweet Treats",
      date: "2025-07-22 16:10",
      read: true,
    },
    {
      id: "3",
      type: "order",
      title: "Order Delivered!",
      message: "Your order #12345 has been delivered.",
      date: "2025-07-21 18:45",
      read: false,
    },
    {
      id: "4",
      type: "product",
      title: "Promo at Coffee Corner",
      message: "Coffee Corner is offering 20% off on all drinks!",
      productId: "coffee-corner-promo",
      storeName: "Coffee Corner",
      date: "2025-07-20 12:00",
      read: true,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.leftColumn}>
          <View style={styles.greetingWrapper}>
            <BlurView intensity={50} tint="light" style={styles.greetingBlur} />
            <Text style={styles.greetingText}>
              {getGreeting()}{" "}
              <Text style={styles.highlight}>{getGreetingTime()}</Text>
            </Text>
          </View>
          {onLocationPress ? (
            <TouchableOpacity
              style={styles.locationRow}
              onPress={onLocationPress}
              activeOpacity={0.7}
            >
              <Image
                source={require("../assets/icons/location.png")}
                style={styles.locationIcon}
              />
              <Text
                style={[
                  styles.locationText,
                  { textDecorationLine: "underline", color: "#0d2329" },
                ]}
              >
                {location}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.locationRow}>
              <Image
                source={require("../assets/icons/location.png")}
                style={styles.locationIcon}
              />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          )}
        </View>
        <NotificationBell
          unreadCount={mockNotifications.filter((n) => !n.read).length}
        />
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
    alignItems: "flex-start",
  },
  leftColumn: {
    flex: 1,
    marginRight: 90, //mao ning naka change sa gap sa icon and greeter for blur
  },
  greetingWrapper: {
    position: "relative",
    width: 270,
    marginBottom: 4,
    height: 50, // you can adjust this
    justifyContent: "center",
  },
  greetingBlur: {
    position: "absolute",
    left: -16, // override the container margin
    right: 10, // space for notification icon
    height: "100%",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: "rgb(255, 255, 255)",
    borderColor: "rgba(197, 197, 197, 0.94)",
    borderWidth: 0.5,
  },
  greetingText: {
    fontSize: 25,
    fontFamily: "Poppins-SemiBold",
    color: "#000",
    paddingLeft: 20, // aligns with rest of the content
    paddingRight: 0,
  },
  highlight: {
    color: "#4CAF50",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: {
    width: 24,
    height: 24,
    marginRight: 4,
    tintColor: "#2C3E50",
  },
  locationText: {
    color: "#444",
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
  notificationIcon: {
    marginTop: 10,
    width: 24,
    height: 24,
    tintColor: "#2C3E50",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#F44336",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 3,
  },
});

export default GreeterSection;
