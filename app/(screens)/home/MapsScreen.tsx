import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, MapPressEvent, Circle } from "react-native-maps";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import * as Location from "expo-location";
import { useLocationContext } from "@/context/LocationContext";
import type { SavedLocation } from "@/context/LocationContext";

const { height } = Dimensions.get("window");

const MapsScreen = () => {
  // Core state
  const [marker, setMarker] = useState<{latitude: number; longitude: number} | null>(null);
  const [initialRegion, setInitialRegion] = useState<{latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number} | null>(null);
  const [locationText, setLocationText] = useState("Tap to select location");
  const [isLoading, setIsLoading] = useState(true);
  
  // UI state
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveLocationLabel, setSaveLocationLabel] = useState("");
  const [isNewLocation, setIsNewLocation] = useState(false);
  const [currentDeviceLocation, setCurrentDeviceLocation] = useState<{latitude: number; longitude: number} | null>(null);
  
  const drawerAnimation = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);
  const hasInitialized = useRef(false);
  const router = useRouter();
  
  const {
    currentLocation,
    savedLocations,
    isLoading: isLoadingSavedLocations,
    isSaving: isSavingLocation,
    isDeleting: isDeletingLocation,
    saveLocation,
    fetchAllLocations,
    deleteSavedLocation,
    setLocation,
  } = useLocationContext();

  // Get address from coordinates
  const getAddressFromCoords = useCallback(async (coords: { latitude: number; longitude: number }): Promise<string> => {
    try {
      const addresses = await Location.reverseGeocodeAsync(coords);
      if (addresses.length > 0) {
        const addr = addresses[0];
        const parts = [
          `${addr?.name || ''} ${addr?.district || ''}`.trim(),
          `${addr?.city || ''} ${addr?.region || ''}`.trim(),
        ].filter(Boolean).slice(0, 2);
        return parts.join(", ") || "Unknown location";
      }
      return "Unknown location";
    } catch (error) {
      console.error("Error getting address:", error);
      return "Unknown location";
    }
  }, []);

  // Initialize map - runs once on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeMap = async () => {
      try {
        // First, try to use stored location from context
        if (currentLocation) {
          const address = await getAddressFromCoords(currentLocation);
          setMarker(currentLocation);
          setInitialRegion({
            ...currentLocation,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
          setLocationText(address);
          setCurrentDeviceLocation(currentLocation);
          setIsLoading(false);
          return;
        }

        // Otherwise, request location permission and get current location
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status === 'granted') {
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          
          const address = await getAddressFromCoords(location);
          setMarker(location);
          setInitialRegion({
            ...location,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
          setLocationText(address);
          setCurrentDeviceLocation(location);
        } else {
          // No permission - use default location (Manila, Philippines as fallback)
          const defaultLocation = { latitude: 14.5995, longitude: 120.9842 };
          setMarker(defaultLocation);
          setInitialRegion({
            ...defaultLocation,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
          setLocationText("Location permission required");
        }
      } catch (error) {
        console.error("Error initializing map:", error);
        // Fallback location
        const defaultLocation = { latitude: 14.5995, longitude: 120.9842 };
        setMarker(defaultLocation);
        setInitialRegion({
          ...defaultLocation,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        setLocationText("Unable to get location");
      } finally {
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [currentLocation, getAddressFromCoords]);

  // Load saved locations
  useEffect(() => {
    fetchAllLocations().catch(err => console.warn('Failed to load saved locations:', err));
  }, [fetchAllLocations]);

  const handleMapPress = async (e: MapPressEvent) => {
    const newLocation = e.nativeEvent.coordinate;
    setMarker(newLocation);
    setIsNewLocation(true);
    const address = await getAddressFromCoords(newLocation);
    setLocationText(address);
  };

  const handleSavedLocationSelect = async (savedLocation: SavedLocation) => {
    const location = {
      latitude: savedLocation.latitude,
      longitude: savedLocation.longitude,
    };
    setMarker(location);
    setIsNewLocation(false);
    const address = await getAddressFromCoords(location);
    setLocationText(address);
    toggleDrawer();
    
    // Animate map to the selected location
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...location,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 500);
    }
  };

  const handleDeleteLocation = async (locationId: string, locationLabel: string) => {
    Alert.alert(
      'Delete Location',
      `Are you sure you want to delete "${locationLabel}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSavedLocation(locationId);
              Alert.alert('Success', 'Location deleted successfully!');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete location.');
            }
          },
        },
      ]
    );
  };

  const toggleDrawer = () => {
    const toValue = isDrawerExpanded ? 0 : 1;
    setIsDrawerExpanded(!isDrawerExpanded);
    
    Animated.timing(drawerAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleSaveLocation = async () => {
    if (!saveLocationLabel.trim() || !marker) {
      Alert.alert('Error', 'Please enter a label for this location');
      return;
    }

    try {
      const addresses = await Location.reverseGeocodeAsync(marker);
      let locationData: any = {
        latitude: marker.latitude,
        longitude: marker.longitude,
        label: saveLocationLabel.trim(),
      };

      if (addresses.length > 0) {
        const addr = addresses[0];
        locationData = {
          ...locationData,
          address: `${addr?.name || ''} ${addr?.district || ''}`.trim() || undefined,
          city: addr?.city || undefined,
          province: addr?.region || undefined,
          postalCode: addr?.postalCode || undefined,
        };
      }

      await saveLocation(locationData, locationData.label);
      
      setShowSaveModal(false);
      setSaveLocationLabel('');
      setIsNewLocation(false);
      Alert.alert('Success', 'Location saved successfully!');
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save location.");
    }
  };

  const handleResetToCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable location services to use this feature.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const freshLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      
      setCurrentDeviceLocation(freshLocation);
      setMarker(freshLocation);
      setIsNewLocation(false);
      
      const address = await getAddressFromCoords(freshLocation);
      setLocationText(address);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...freshLocation,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not get your current location');
    }
  };

  const handleConfirm = async () => {
    if (!marker) {
      Alert.alert('Error', 'Please select a location first');
      return;
    }

    try {
      await setLocation(marker);
      Alert.alert("Success", "Location confirmed successfully!");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to confirm location.");
    }
  };

  // Loading state
  if (isLoading || !initialRegion) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom', 'left', 'right']}>
        <TouchableOpacity style={styles.loadingCloseButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingTitle}>Loading map...</Text>
          <Text style={styles.loadingSubtitle}>Getting your location</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={handleMapPress}
      >
        {/* Current Device Location Indicator */}
        {currentDeviceLocation && (
          <>
            <Circle
              center={currentDeviceLocation}
              radius={50}
              fillColor={colors.info + '20'}
              strokeColor={colors.info}
              strokeWidth={2}
            />
            <Marker
              coordinate={currentDeviceLocation}
              anchor={{x: 0.5, y: 0.5}}
            >
              <View style={styles.currentLocationMarker}>
                <View style={styles.currentLocationDot} />
              </View>
            </Marker>
          </>
        )}
        
        {/* Selected Location Marker */}
        {marker && (
          <Marker
            coordinate={marker}
            pinColor={colors.success}
            draggable
            onDragEnd={async (e) => {
              const newCoords = e.nativeEvent.coordinate;
              setMarker(newCoords);
              setIsNewLocation(true);
              const address = await getAddressFromCoords(newCoords);
              setLocationText(address);
            }}
          />
        )}
      </MapView>
      
      {/* Floating Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Ionicons name="close" size={24} color={colors.text.primary} />
      </TouchableOpacity>

      {/* Recenter Button */}
      <TouchableOpacity style={styles.recenterButton} onPress={handleResetToCurrentLocation}>
        <Ionicons name="locate" size={22} color={colors.text.primary} />
      </TouchableOpacity>
      
      {/* Bottom Drawer */}
      <Animated.View style={[
        styles.bottomCard,
        {
          height: drawerAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [200, Dimensions.get('window').height * 0.6],
          }),
        },
      ]}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.drawerHeader}>
          <View style={styles.drawerHandle} />
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={24} color={colors.primary.main} style={styles.locationIcon} />
            <Text style={styles.locationText} numberOfLines={2}>{locationText}</Text>
            <Ionicons 
              name={isDrawerExpanded ? "chevron-down" : "chevron-up"} 
              size={20} 
              color={colors.text.secondary} 
            />
          </View>
        </TouchableOpacity>

        {/* Saved Locations */}
        <Animated.View style={[
          styles.savedLocationsContainer,
          {
            opacity: drawerAnimation,
            maxHeight: drawerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 200],
            }),
          },
        ]}>
          <Text style={styles.savedLocationsTitle}>Saved Locations</Text>
          <ScrollView style={styles.savedLocationsList} showsVerticalScrollIndicator={false}>
            {savedLocations.length > 0 ? (
              savedLocations.map((location) => (
                <View key={location.id} style={styles.savedLocationItem}>
                  <TouchableOpacity 
                    style={styles.savedLocationMain}
                    onPress={() => handleSavedLocationSelect(location)}
                  >
                    <Ionicons name="location" size={18} color={colors.primary.main} />
                    <View style={styles.savedLocationInfo}>
                      <Text style={styles.savedLocationLabel}>{location.label}</Text>
                      <Text style={styles.savedLocationAddress} numberOfLines={1}>
                        {location.address || `${location.latitude?.toFixed(4)}, ${location.longitude?.toFixed(4)}`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteLocationBtn}
                    onPress={() => handleDeleteLocation(location.id, location.label)}
                    disabled={isDeletingLocation}
                  >
                    <Ionicons 
                      name="trash-outline" 
                      size={16} 
                      color={isDeletingLocation ? colors.text.disabled : colors.error} 
                    />
                  </TouchableOpacity>
                </View>
              ))
            ) : isLoadingSavedLocations ? (
              <ActivityIndicator size="small" color={colors.primary.main} style={{ padding: 16 }} />
            ) : (
              <Text style={styles.noSavedLocationsText}>
                No saved locations yet. Save your current location to see it here.
              </Text>
            )}
          </ScrollView>
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isNewLocation && (
            <TouchableOpacity 
              style={styles.saveLocationBtn} 
              onPress={() => setShowSaveModal(true)}
            >
              <Ionicons name="bookmark-outline" size={20} color={colors.primary.main} />
              <Text style={styles.saveLocationBtnText}>Save Location</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmBtnText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.infoText}>
            Your location will be used to find stores and promotions nearby
          </Text>
        </View>
      </Animated.View>

      {/* Save Location Modal */}
      <Modal
        visible={showSaveModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Location</Text>
            <Text style={styles.modalSubtitle}>
              Give this location a name so you can find it easily later
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter location name (e.g., Home, Work)"
              value={saveLocationLabel}
              onChangeText={setSaveLocationLabel}
              maxLength={50}
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => {
                  setShowSaveModal(false);
                  setSaveLocationLabel('');
                }}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalSaveBtn, isSavingLocation && styles.modalSaveBtnDisabled]} 
                onPress={handleSaveLocation}
                disabled={isSavingLocation}
              >
                <Text style={styles.modalSaveBtnText}>
                  {isSavingLocation ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  recenterButton: {
    position: 'absolute',
    top: 120,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  currentLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  currentLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.info,
  },
  bottomCard: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
  drawerHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.text.secondary,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  savedLocationsContainer: {
    paddingHorizontal: 24,
    flex: 1,
  },
  savedLocationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  savedLocationsList: {
    maxHeight: 150,
  },
  savedLocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    marginBottom: 8,
    paddingRight: 8,
  },
  savedLocationMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  savedLocationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  deleteLocationBtn: {
    padding: 8,
    borderRadius: 8,
  },
  savedLocationLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 2,
  },
  savedLocationAddress: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  noSavedLocationsText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 16,
  },
  actionButtons: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  saveLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary.main + '30',
  },
  saveLocationBtnText: {
    color: colors.primary.main,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.background.tertiary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.text.secondary,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: colors.text.secondary,
    fontWeight: '600',
    fontSize: 16,
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
  },
  modalSaveBtnDisabled: {
    backgroundColor: colors.text.secondary,
  },
  modalSaveBtnText: {
    color: colors.text.inverse,
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default MapsScreen;
