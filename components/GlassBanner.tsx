import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const GlassBanner = () => {
  return (
    <View style={styles.container}>
      <BlurView intensity={50} tint="light" style={styles.blurContainer}>
        <Text style={styles.text}>{getGreeting()}</Text>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  blurContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    overflow: 'hidden',
  },
  text: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
});

export default GlassBanner;
