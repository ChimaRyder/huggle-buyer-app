/**
 * Home Screen
 * Main landing screen showing categories, products, and user greeting
 */

import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';

import { CategoryCarousel, GreeterSection } from '@/components/layout';
import { ProductGrid } from '@/components/product';
import { colors, spacing, layout, shadows, radii } from '@/constants/theme';

interface HomeScreenProps {}

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const { getToken } = useAuth();
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    checkUserLocation();
  }, []);

  const checkUserLocation = async (): Promise<void> => {
    try {
      // TODO: Replace with backend check instead of AsyncStorage
      const location = await AsyncStorage.getItem('userLocation');
      if (!location) {
        setShowLocationModal(true);
      }
    } catch (error) {
      console.error('Error checking user location:', error);
    }
  };

  const handleLocationModalConfirm = (): void => {
    setShowLocationModal(false);
    router.push('/screens/MapsScreen');
  };

  const handleLocationPress = (): void => {
    router.push('/screens/MapsScreen');
  };

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    
    try {
      // TODO: Implement actual data refresh logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCartPress = (): void => {
    router.push('/(screens)/cart' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <GreeterSection onLocationPress={handleLocationPress} />
        <CategoryCarousel />
        <View style={styles.productsContainer}>
          <ProductGrid />
        </View>
      </ScrollView>
      
      {/* Floating Cart Button */}
      <TouchableOpacity
        style={styles.floatingCartButton}
        onPress={handleCartPress}
        activeOpacity={0.8}
      >
        <Ionicons name="cart" size={32} color={colors.text.inverse} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
  },
  productsContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  floatingCartButton: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
});

export default HomeScreen;
