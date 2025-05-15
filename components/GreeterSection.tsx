import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';

const screenWidth = Dimensions.get('window').width;

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
      <View style={styles.row}>
        <View style={styles.leftColumn}>
          <View style={styles.greetingWrapper}>
            <BlurView intensity={50} tint="light" style={styles.greetingBlur} />
            <Text style={styles.greetingText}>
              {getGreeting()} <Text style={styles.highlight}>{getGreetingTime()}</Text>
            </Text>
          </View>
          <View style={styles.locationRow}>
            <Image source={require('../assets/icons/location.png')} style={styles.locationIcon} />
            <Text style={styles.locationText}>{location}</Text>
          </View>
        </View>
        <Image source={require('../assets/icons/bell.png')} style={styles.notificationIcon} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftColumn: {
    flex: 1,
    marginRight: 90, //mao ning naka change sa gap sa icon and greeter for blur
  },
  greetingWrapper: {
    position: 'relative',
    marginBottom: 4,
    height: 50, // you can adjust this
    justifyContent: 'center',
  },
  greetingBlur: {
    position: 'absolute',
    left: -16, // override the container margin
    right: 10, // space for notification icon
    height: '100%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: 'rgb(255, 255, 255)',
    borderColor: 'rgba(197, 197, 197, 0.94)',
    borderWidth: 0.5,
  },
  greetingText: {
    fontSize: 25,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
    paddingLeft: 20, // aligns with rest of the content
    paddingRight: 0,
  },
  highlight: {
    color: '#4CAF50',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    width: 24,
    height: 24,
    marginRight: 4,
    tintColor: '#2C3E50',
  },
  locationText: {
    color: '#444',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  notificationIcon: {
    marginTop: 10,
    width: 24,
    height: 24,
    tintColor: '#2C3E50',
  },
});

export default GreeterSection;
