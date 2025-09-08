import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, MapPressEvent } from "react-native-maps";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { updateBuyerLocation } from "../../utils/api";
import * as Location from "expo-location";
import { fetchBuyerById } from "../../utils/user";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const MapsScreen = ({ route }: any) => {
  const defaultLocation = { latitude: 37.7577, longitude: -122.4376 };
  const [marker, setMarker] = useState(defaultLocation);
  const [locationLoaded, setLocationLoaded] = useState(false);
  const [initialRegion, setInitialRegion] = useState(defaultLocation);
  const [locationText, setLocationText] = useState("Fetching location...");
  const mapRef = useRef<MapView>(null);
  const router = useRouter();
  const { userId, getToken } = useAuth();

  React.useEffect(() => {
    let isMounted = true;
    const preloadLocation = async () => {
      if (route?.params?.location) {
        setMarker(route.params.location);
        setInitialRegion(route.params.location);
        await updateLocationText(route.params.location);
        setLocationLoaded(true);
        return;
      }
      // 1. Try to get from backend
      try {
        const token = await getToken({ template: "seller_app" });
        if (userId && token) {
          const buyer = await fetchBuyerById(userId, token);
          if (buyer && buyer.latitude && buyer.longitude) {
            const dbLoc = {
              latitude: buyer.latitude,
              longitude: buyer.longitude,
            };
            setMarker(dbLoc);
            setInitialRegion(dbLoc);
            await updateLocationText(dbLoc);
            setLocationLoaded(true);
            return;
          }
        }
      } catch {}
      // 2. Fallback to device geolocation
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationText("Location permission denied");
          setLocationLoaded(true);
          return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        if (isMounted) {
          setMarker(coords);
          setInitialRegion(coords);
          await updateLocationText(coords);
        }
      } catch {
        setLocationText("Failed to fetch location");
      }
      setLocationLoaded(true);
    };
    preloadLocation();
    return () => {
      isMounted = false;
    };
  }, []);

  const updateLocationText = async (coordinates: { latitude: number; longitude: number }) => {
    try {
      const address = await Location.reverseGeocodeAsync(coordinates);
      if (address.length > 0) {
        const {
          street,
          district,
          city,
          region,
        } = address[0];
        const parts = [
          `${street} ${district}`,
          `${city} ${region}`,
        ]
          .filter(Boolean)
          .slice(0, 2);
        setLocationText(parts.join(", "));
      } else {
        setLocationText("Unknown location");
      }
    } catch (error) {
      console.error("Error getting location text:", error);
      setLocationText("Unknown location");
    }
  };

  const handleMapPress = (e: MapPressEvent) => {
    setMarker(e.nativeEvent.coordinate);
    updateLocationText(e.nativeEvent.coordinate);
  };

  const handleConfirm = async () => {
    try {
      if (!userId) {
        Alert.alert("Error", "User not logged in.");
        return;
      }
      const token = await getToken({ template: "seller_app" });
      if (!token) {
        Alert.alert("Error", "Unable to get authentication token.");
        return;
      }
      await updateBuyerLocation(
        userId,
        marker.longitude,
        marker.latitude,
        token
      );
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update location.");
    }
  };

  if (!locationLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom', 'left', 'right']}>
        <Text style={styles.loadingText}>Getting your location...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: initialRegion.latitude,
          longitude: initialRegion.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
      >
        <Marker
          coordinate={marker}
          pinColor={colors.success}
          draggable
          onDragEnd={(e) => {
            setMarker(e.nativeEvent.coordinate);
            updateLocationText(e.nativeEvent.coordinate);
          }}
        />
      </MapView>
      
      {/* Floating Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Ionicons name="close" size={24} color={colors.text.primary} />
      </TouchableOpacity>
      
      {/* Bottom Drawer */}
      <View style={styles.bottomCard}>
        <View style={styles.locationContainer}>
          <Ionicons 
            name="location" 
            size={24} 
            color={colors.primary} 
            style={styles.locationIcon}
          />
          <Text style={styles.locationText}>
            {locationText}
          </Text>
        </View>
        
        <View style={styles.infoBox}>
          <Ionicons 
            name="information-circle-outline" 
            size={20} 
            color={colors.text.secondary} 
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>
            Your location will be used to find stores and promotions nearby
          </Text>
        </View>
        
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmBtnText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  map: {
    flex: 1,
    width: "100%",
    height: height,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomCard: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  confirmBtn: {
    backgroundColor: colors.success,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmBtnText: {
    color: colors.text.inverse,
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.primary,
  },
});

export default MapsScreen;
