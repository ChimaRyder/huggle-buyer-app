import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity, Platform, Alert } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@clerk/clerk-expo';
import { updateBuyerLocation } from '../../utils/api';

const { width, height } = Dimensions.get('window');

const MapsScreen = ({ route }: any) => {
  // Optionally accept initial location from props/route
  const initialLocation = route?.params?.location || {
    latitude: 37.7577,
    longitude: -122.4376,
  };

  const [marker, setMarker] = useState(initialLocation);
  const mapRef = useRef<MapView>(null);
  const router = useRouter();
  const { userId, getToken } = useAuth();

  const handleMapPress = (e: MapPressEvent) => {
    setMarker(e.nativeEvent.coordinate);
  };

  const handleConfirm = async () => {
    try {
      if (!userId) {
        Alert.alert('Error', 'User not logged in.');
        return;
      }
      const token = await getToken({ template: 'seller_app' });
      if (!token) {
        Alert.alert('Error', 'Unable to get authentication token.');
        return;
      }
      await updateBuyerLocation(userId, marker.longitude, marker.latitude, token);
      await AsyncStorage.setItem('userLocation', JSON.stringify(marker));
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update location.');
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: marker.latitude,
          longitude: marker.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
      >
        <Marker coordinate={marker} draggable onDragEnd={e => setMarker(e.nativeEvent.coordinate)} />
      </MapView>
      <View style={styles.bottomCard}>
        <Text style={styles.title}>Pinpoint your location</Text>
        <TextInput
          style={styles.input}
          value={String(marker.longitude)}
          editable={false}
          placeholder="Longitude"
        />
        <TextInput
          style={styles.input}
          value={String(marker.latitude)}
          editable={false}
          placeholder="Latitude"
        />
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmBtnText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
    width: '100%',
    height: height,
  },
  bottomCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 12,
    color: '#222',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  confirmBtn: {
    marginTop: 16,
    backgroundColor: '#0d2329',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MapsScreen;
