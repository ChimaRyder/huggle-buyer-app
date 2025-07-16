import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, Platform, Text } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '@clerk/clerk-expo';

interface OrderMapProps {
  latitude?: number; // fallback location
  longitude?: number; // fallback location
  label?: string;
}

const OrderMap: React.FC<OrderMapProps> = ({ latitude, longitude, label }) => {
  const [region, setRegion] = useState<Region | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const fetchedToken = await getToken?.({ template: "seller_app" });
      setToken(fetchedToken || null);
    })();
  }, [getToken]);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          if (latitude && longitude) {
            setRegion({
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
          setLoading(false);
          return;
        }
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setUserLocation({ lat: location.coords.latitude, lng: location.coords.longitude });
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (e) {
        setError('Failed to get current location');
        if (latitude && longitude) {
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [latitude, longitude]);

  if (loading || !region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#548C2F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!token && (
        <View style={{ backgroundColor: '#FFF3CD', padding: 8, borderRadius: 8, marginBottom: 8 }}>
          <Text style={{ color: '#856404', fontSize: 13 }}>
            Warning: Auth token not available. Map requests may not be authenticated.
          </Text>
        </View>
      )}
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        loadingEnabled={true}
        // Pass token to custom tile provider here if needed: tileProviderToken={token}
      >
        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}
          title={label || 'Your Location'}
          description={label || 'Current location'}
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 8,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    marginVertical: 8,
  },
});

export default OrderMap;
