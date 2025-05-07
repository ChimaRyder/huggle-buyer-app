import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good';
  if (hour < 18) return 'Good';
  return 'Good';
};

const getGreetingTime = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning!';
  if (hour < 18) return 'afternoon!';
  return 'evening!';
};

const GreeterSection = () => {
  const [location, setLocation] = useState<string>('Fetching location...');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation('Location permission denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync(loc.coords);
      if (address.length > 0) {
        const { street, city } = address[0];
        setLocation(`${street}, ${city}`);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <BlurView intensity={50} tint="light" style={styles.blurContainer}>
        <View style={styles.row}>
          <View>
            <Text style={styles.greetingText}>
              {getGreeting()} <Text style={styles.highlight}>{getGreetingTime()}</Text>
            </Text>
            <View style={styles.locationRow}>
              <Image source={require('../assets/icons/location.png')} style={styles.locationIcon} />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          </View>
          <Image source={require('../assets/icons/bell.png')} style={styles.notificationIcon} />
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    marginBottom: 8,
  },
  blurContainer: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#000',
  },
  highlight: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
    tintColor: '#2C3E50',
  },
  locationText: {
    color: '#444',
    fontSize: 14,
    fontFamily: 'Poppins',
  },
  notificationIcon: {
    width: 24,
    height: 24,
    tintColor: '#2C3E50',
  },
});

export default GreeterSection;
