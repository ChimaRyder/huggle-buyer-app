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
  const { currentLocation, savedLocations } = useLocationContext();

  // Helper function to truncate location text to 25 characters
  const truncateLocation = (text: string, maxLength: number = 25): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

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

  // Helper function to find if current location matches a saved location
  const findMatchingSavedLocation = (current: typeof currentLocation) => {
    if (!current || !savedLocations.length) return null;
    
    // Find saved location with matching coordinates (within small tolerance)
    return savedLocations.find(saved => {
      const latDiff = Math.abs(saved.latitude - current.latitude);
      const lngDiff = Math.abs(saved.longitude - current.longitude);
      // Consider locations within ~100m as the same (roughly 0.001 degrees)
      return latDiff < 0.001 && lngDiff < 0.001;
    });
  };

  // Helper function to check if coordinates look like they might be from a saved location
  // (as a fallback when fetchAllLocations fails)
  const isLikelyUserSavedLocation = (current: typeof currentLocation) => {
    if (!current) return false;
    // This is a heuristic - if coordinates have been set programmatically (like from a map selection)
    // they often have many decimal places, unlike device GPS which tends to be less precise
    const latDecimals = (current.latitude.toString().split('.')[1] || '').length;
    const lngDecimals = (current.longitude.toString().split('.')[1] || '').length;
    return latDecimals > 10 || lngDecimals > 10;
  };

  // Update display location when currentLocation from context changes
  useEffect(() => {
    const updateDisplayLocation = async () => {
      try {
        if (currentLocation) {
          // Check if current location is a saved location (has label property)
          if ('label' in currentLocation && currentLocation.label) {
            // Use the saved location's label
            const truncatedLabel = truncateLocation(currentLocation.label);
            setDisplayLocation(truncatedLabel);
            return;
          }
          
          // Fallback: check if this location matches a saved location by coordinates
          const matchingSavedLocation = findMatchingSavedLocation(currentLocation);
          if (matchingSavedLocation) {
            // Use the saved location's label
            const truncatedLabel = truncateLocation(matchingSavedLocation.label);
            setDisplayLocation(truncatedLabel);
            return;
          }
          
          // Additional fallback: if this looks like a user-selected location but we can't fetch saved locations
          // show a generic "Selected Location" label instead of trying to geocode
          if (isLikelyUserSavedLocation(currentLocation) && savedLocations.length === 0) {
            setDisplayLocation(truncateLocation("Selected Location"));
            return;
          }
          
          // Use the selected location from LocationContext if available
          if (currentLocation.address) {
            // Use the address from the context if it exists
            const truncatedLocation = truncateLocation(currentLocation.address);
            setDisplayLocation(truncatedLocation);
          } else {
            // Reverse geocode the coordinates from context
            const address = await Location.reverseGeocodeAsync({
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            });
            if (address.length > 0) {
              const addressInfo = address[0];
              
              // Create a more reliable location string by prioritizing key components
              const locationParts = [];
              
              // Priority 1: Street or name (most specific)
              if (addressInfo.street) {
                locationParts.push(addressInfo.street);
              } else if (addressInfo.name) {
                locationParts.push(addressInfo.name);
              }
              
              // Priority 2: District or subregion (neighborhood level)
              if (addressInfo.district) {
                locationParts.push(addressInfo.district);
              } else if (addressInfo.subregion) {
                locationParts.push(addressInfo.subregion);
              }
              
              // Priority 3: City (always try to include)
              if (addressInfo.city) {
                locationParts.push(addressInfo.city);
              }
              
              // Fallback: Use region if city is missing
              if (!addressInfo.city && addressInfo.region) {
                locationParts.push(addressInfo.region);
              }
              
              const locationString = locationParts.length > 0 
                ? locationParts.join(", ")
                : `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`;
                
              const truncatedLocation = truncateLocation(locationString);
              setDisplayLocation(truncatedLocation);
            } else {
              // Fallback to coordinates if reverse geocoding fails
              const coordsString = `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`;
              setDisplayLocation(truncateLocation(coordsString));
            }
          }
        } else {
          // Fallback to device location if no location is selected in context
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            setDisplayLocation(truncateLocation("Location access denied"));
            return;
          }
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          const address = await Location.reverseGeocodeAsync(loc.coords);
          if (address.length > 0) {
            const addressInfo = address[0];
            
            // Create a more reliable location string by prioritizing key components
            const locationParts = [];
            
            // Priority 1: Street or name (most specific)
            if (addressInfo.street) {
              locationParts.push(addressInfo.street);
            } else if (addressInfo.name) {
              locationParts.push(addressInfo.name);
            }
            
            // Priority 2: District or subregion (neighborhood level)
            if (addressInfo.district) {
              locationParts.push(addressInfo.district);
            } else if (addressInfo.subregion) {
              locationParts.push(addressInfo.subregion);
            }
            
            // Priority 3: City (always try to include)
            if (addressInfo.city) {
              locationParts.push(addressInfo.city);
            }
            
            // Fallback: Use region if city is missing
            if (!addressInfo.city && addressInfo.region) {
              locationParts.push(addressInfo.region);
            }
            
            const locationString = locationParts.length > 0 
              ? locationParts.join(", ")
              : `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`;
              
            const truncatedLocation = truncateLocation(locationString);
            setDisplayLocation(truncatedLocation);
          } else {
            // Fallback to coordinates if reverse geocoding fails
            const coordsString = `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`;
            setDisplayLocation(truncateLocation(coordsString));
          }
        }
      } catch (error) {
        console.error("Error getting location:", error);
        setDisplayLocation(truncateLocation("Failed to get location"));
      }
    };

    updateDisplayLocation();
  }, [currentLocation, savedLocations]);

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
    margin: 16,
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
