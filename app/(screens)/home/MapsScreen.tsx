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
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, MapPressEvent } from "react-native-maps";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import * as Location from "expo-location";
import { useLocationContext } from "@/context/LocationContext";
import type { SavedLocation } from "@/context/LocationContext";

const { height } = Dimensions.get("window");

const MapsScreen = ({ route }: any) => {
  console.log('🚀 MapsScreen: Component initializing...');
  const [marker, setMarker] = useState<{latitude: number; longitude: number} | null>(null);
  const [locationLoaded, setLocationLoaded] = useState(false);
  const [initialRegion, setInitialRegion] = useState<{latitude: number; longitude: number} | null>(null);
  const [locationText, setLocationText] = useState("Fetching location...");
  
  console.log('🔍 MapsScreen: Initial state - locationLoaded:', false, 'locationText:', "Fetching location...");
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveLocationLabel, setSaveLocationLabel] = useState("");
  const [isNewLocation, setIsNewLocation] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [canRequestPermission, setCanRequestPermission] = useState(true);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const drawerAnimation = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);
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
  
  console.log('🔍 MapsScreen: LocationContext values - currentLocation:', currentLocation, 'isLoading:', isLoadingSavedLocations);

  // Simple location permission functions
  const checkLocationPermission = useCallback(async () => {
    try {
      console.log('🔐 MapsScreen: Checking location permission...');
      const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
      console.log('🔐 MapsScreen: Permission status:', status, 'canAskAgain:', canAskAgain);
      
      const granted = status === 'granted';
      setHasLocationPermission(granted);
      setCanRequestPermission(canAskAgain);
      
      console.log('🔐 MapsScreen: Set hasLocationPermission to:', granted);
    } catch (error) {
      console.error('❌ MapsScreen: Error checking location permission:', error);
    }
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasLocationPermission(granted);
      setCanRequestPermission(canAskAgain);
      return granted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const getCurrentLocation = useCallback(async () => {
    try {
      console.log('📍 MapsScreen: getCurrentLocation - Starting location fetch...');
      setIsLoadingLocation(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('📍 MapsScreen: getCurrentLocation - Permission status:', status);
      
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      console.log('📍 MapsScreen: getCurrentLocation - Getting position with high accuracy...');
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      console.log('📍 MapsScreen: getCurrentLocation - Raw position:', position);

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      console.log('📍 MapsScreen: getCurrentLocation - Processed location:', location);
      setHasLocationPermission(true);
      return location;
    } catch (error) {
      console.error('❌ MapsScreen: getCurrentLocation - Error details:', error);
      console.error('❌ MapsScreen: getCurrentLocation - Error message:', error instanceof Error ? error.message : String(error));
      return null;
    } finally {
      setIsLoadingLocation(false);
      console.log('📍 MapsScreen: getCurrentLocation - Finished (loading set to false)');
    }
  }, []);

  // Location text update function
  const updateLocationText = useCallback(async (coordinates: { latitude: number; longitude: number }) => {
    try {
      const address = await Location.reverseGeocodeAsync(coordinates);
      if (address.length > 0) {
        const addr = address[0];
        const parts = [
          `${addr?.name || ''} ${addr?.district || ''}`.trim(),
          `${addr?.city || ''} ${addr?.region || ''}`.trim(),
        ]
          .filter(Boolean)
          .slice(0, 2);
        setLocationText(parts.join(", ") || "Unknown location");
      } else {
        setLocationText("Unknown location");
      }
    } catch (error) {
      console.error("Error getting location text:", error);
      setLocationText("Unknown location");
    }
  }, []);

  // Simple function to save current location to storage
  const confirmLocation = async (location: { latitude: number; longitude: number }) => {
    try {
      await setLocation(location);
    } catch (error) {
      console.error('Error saving current location:', error);
      throw error;
    }
  };

  // Initialize permissions on mount
  useEffect(() => {
    console.log('🔄 MapsScreen: useEffect - Checking location permission...');
    checkLocationPermission();
  }, []);

  // Load stored location from context
  useEffect(() => {
    console.log('🔄 MapsScreen: useEffect - currentLocation changed. currentLocation:', currentLocation, 'locationLoaded:', locationLoaded);
    
    if (currentLocation && !locationLoaded) {
      console.log('✅ MapsScreen: Loading stored location from context:', currentLocation);
      setMarker(currentLocation);
      setInitialRegion(currentLocation);
      updateLocationText(currentLocation);
      setLocationLoaded(true);
      console.log('✅ MapsScreen: Set locationLoaded to true');
    } else if (!currentLocation) {
      console.log('❌ MapsScreen: No currentLocation from context');
    } else if (locationLoaded) {
      console.log('ℹ️ MapsScreen: Location already loaded, skipping');
    }
  }, [currentLocation, locationLoaded, updateLocationText]);

  // Load saved locations on mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        await fetchAllLocations();
      } catch (error) {
        console.warn('Failed to load saved locations:', error);
        // Don't block the UI if this fails
      }
    };
    loadLocations();
  }, []);

  // Effect for initial route params location
  React.useEffect(() => {
    console.log('🔄 MapsScreen: useEffect - route params changed. route.params.location:', route?.params?.location);
    
    if (route?.params?.location) {
      console.log('✅ MapsScreen: Loading location from route params:', route.params.location);
      setMarker(route.params.location);
      setInitialRegion(route.params.location);
      updateLocationText(route.params.location);
      setLocationLoaded(true);
      console.log('✅ MapsScreen: Set locationLoaded to true from route params');
    }
  }, [route?.params?.location, updateLocationText]);

  // Main location loading effect
  React.useEffect(() => {
    let isMounted = true;
    console.log('🔄 MapsScreen: Main location loading useEffect triggered');
    console.log('🔍 MapsScreen: hasLocationPermission:', hasLocationPermission, 'isLoadingLocation:', isLoadingLocation, 'locationLoaded:', locationLoaded, 'isInitializing:', isInitializing);

    const initializeLocation = async () => {
      console.log('🔄 MapsScreen: initializeLocation called');
      console.log('🔍 MapsScreen: Checking conditions - isInitializing:', isInitializing, 'route.params.location:', route?.params?.location, 'locationLoaded:', locationLoaded);
      
      // Skip if already initializing, we have route params location, or location is already loaded
      if (isInitializing || route?.params?.location || locationLoaded) {
        console.log('⏸️ MapsScreen: Skipping initializeLocation - condition met');
        return;
      }

      console.log('🔄 MapsScreen: Starting location initialization...');
      setIsInitializing(true);

      try {
        // Try to get fresh device location if permission is granted
        if (hasLocationPermission && !isLoadingLocation) {
          console.log('📍 MapsScreen: Trying to get device location...');
          try {
            const deviceLocation = await getCurrentLocation();
            console.log('📍 MapsScreen: Device location result:', deviceLocation);
            
            if (deviceLocation && isMounted) {
              console.log('✅ MapsScreen: Setting device location as marker');
              setMarker(deviceLocation);
              setInitialRegion(deviceLocation);
              await updateLocationText(deviceLocation);
              setLocationLoaded(true);
              console.log('✅ MapsScreen: Set locationLoaded to true from device location');
              return;
            }
          } catch (error) {
            console.log('❌ MapsScreen: Failed to get current location:', error);
          }
        } else {
          console.log('⏸️ MapsScreen: Skipping device location - hasLocationPermission:', hasLocationPermission, 'isLoadingLocation:', isLoadingLocation);
        }

        // No fallback - require location permission and device location
        if (!locationLoaded && isMounted) {
          console.log('⚠️ MapsScreen: Could not get location - need permission');
          setLocationText("Location permission required to continue");
          // Don't set locationLoaded to true - keep showing loading until we get location
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    // Only run initialization if we don't have route params and haven't loaded yet
    if (!route?.params?.location && !locationLoaded && !isInitializing) {
      initializeLocation();
    }

    return () => {
      isMounted = false;
    };
  }, [route?.params?.location, hasLocationPermission, getCurrentLocation, updateLocationText]);

  const handleMapPress = (e: MapPressEvent) => {
    const newLocation = e.nativeEvent.coordinate;
    setMarker(newLocation);
    updateLocationText(newLocation);
    setIsNewLocation(true);
  };

  const handleSavedLocationSelect = async (savedLocation: SavedLocation) => {
    const location = {
      latitude: savedLocation.latitude,
      longitude: savedLocation.longitude,
    };
    setMarker(location);
    await updateLocationText(location);
    setIsNewLocation(false);
    toggleDrawer();
  };

  const handleDeleteLocation = async (locationId: string, locationLabel: string) => {
    Alert.alert(
      'Delete Location',
      `Are you sure you want to delete "${locationLabel}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSavedLocation(locationId);
              Alert.alert('Success', 'Location deleted successfully!');
            } catch (error: any) {
              console.error('Delete location error:', error);
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
    if (!saveLocationLabel.trim()) {
      Alert.alert('Error', 'Please enter a label for this location');
      return;
    }

    try {
      const address = await Location.reverseGeocodeAsync(marker!);
      let locationData: any = {
        latitude: marker!.latitude,
        longitude: marker!.longitude,
        label: saveLocationLabel.trim(),
      };

      if (address.length > 0) {
        const addr = address[0];
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
      console.error("Save location error:", error);
      Alert.alert("Error", error.message || "Failed to save location.");
    }
  };

  const handleRequestLocationPermission = async () => {
    const granted = await requestLocationPermission();
    if (granted) {
      const location = await getCurrentLocation();
      if (location) {
        setMarker(location);
        setInitialRegion(location);
        await updateLocationText(location);
        setLocationLoaded(true);
      }
    }
  };

  const handleConfirm = async () => {
    try {
      // Confirm location only updates AsyncStorage
      await confirmLocation(marker!);
      Alert.alert("Success", "Location confirmed successfully!");
      router.back();
    } catch (error: any) {
      console.error("Location confirmation error:", error);
      Alert.alert("Error", error.message || "Failed to confirm location.");
    }
  };

  if (!locationLoaded || isLoadingLocation || !marker || !initialRegion) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom', 'left', 'right']}>
        <Text style={styles.loadingText}>
          {isLoadingLocation ? 'Getting your current location...' : locationText}
        </Text>
        {!hasLocationPermission && canRequestPermission && (
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={handleRequestLocationPermission}
          >
            <Ionicons 
              name="location-outline" 
              size={20} 
              color={colors.primary} 
              style={styles.permissionIcon}
            />
            <Text style={styles.permissionButtonText}>
              Enable Location Services
            </Text>
          </TouchableOpacity>
        )}
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
      
      {/* Expandable Bottom Drawer */}
      <Animated.View style={[
        styles.bottomCard,
        {
          height: drawerAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [200, Dimensions.get('window').height * 0.6],
          }),
        },
      ]}>
        {/* Drawer Header */}
        <TouchableOpacity onPress={toggleDrawer} style={styles.drawerHeader}>
          <View style={styles.drawerHandle} />
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
            <Ionicons 
              name={isDrawerExpanded ? "chevron-down" : "chevron-up"} 
              size={20} 
              color={colors.text.secondary} 
              style={styles.chevronIcon}
            />
          </View>
        </TouchableOpacity>

        {/* Permission Request Section */}
        {!hasLocationPermission && canRequestPermission && (
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={handleRequestLocationPermission}
          >
            <Ionicons 
              name="location-outline" 
              size={20} 
              color={colors.primary} 
              style={styles.permissionIcon}
            />
            <Text style={styles.permissionButtonText}>
              Enable Location Services
            </Text>
          </TouchableOpacity>
        )}

        {/* Saved Locations Section */}
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
                    <Ionicons name="location" size={18} color={colors.primary} />
                    <View style={styles.savedLocationInfo}>
                      <Text style={styles.savedLocationLabel}>{location.label}</Text>
                      <Text style={styles.savedLocationAddress}>
                        {location.address || `${location.latitude?.toFixed(4) || '0.0000'}, ${location.longitude?.toFixed(4) || '0.0000'}`}
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
              <Text style={styles.loadingText}>Loading...</Text>
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
              <Ionicons name="bookmark-outline" size={20} color={colors.primary} />
              <Text style={styles.saveLocationBtnText}>Save Location</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmBtnText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons 
            name="information-circle-outline" 
            size={16} 
            color={colors.text.secondary} 
            style={styles.infoIcon}
          />
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
              placeholder="Enter location name (e.g., Home, Work, Gym)"
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
    paddingBottom: 24,
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
  chevronIcon: {
    marginLeft: 8,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '10',
    marginHorizontal: 24,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  permissionIcon: {
    marginRight: 8,
  },
  permissionButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
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
    alignItems: 'center',
    justifyContent: 'center',
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
    borderColor: colors.primary + '30',
  },
  saveLocationBtnText: {
    color: colors.primary,
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
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 1,
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
    backgroundColor: colors.primary,
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