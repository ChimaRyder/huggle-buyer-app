/**
 * API Usage Examples
 * Demonstrates how to use the new API Context and services
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useApi } from '@/contexts/ApiContext';
import { productService, locationService, userService, orderService } from '@/services';
import type { BackendProduct, Location, UserProfile, Order } from '@/services';

export const ApiUsageExample: React.FC = () => {
  const { client, isAuthenticated } = useApi();
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Example: Fetch products
  const fetchProducts = async () => {
    const response = await productService.getAllProducts(client, {
      productType: 'food',
      pagination: { page: 1, limit: 10 }
    });
    
    if (response.success && response.data) {
      setProducts(response.data);
    } else {
      console.error('Failed to fetch products:', response.error);
    }
  };

  // Example: Get nearby stores using location
  const findNearbyStores = async () => {
    try {
      // First get current location (implement this with expo-location)
      const currentLocation = await locationService.getCurrentLocation();
      setUserLocation(currentLocation);
      
      // Then find nearby stores
      const response = await locationService.findNearbyStores(
        client,
        currentLocation,
        5000, // 5km radius
        { page: 1, limit: 20 }
      );
      
      if (response.success && response.data) {
        console.log('Found nearby stores:', response.data);
      }
    } catch (error) {
      console.error('Error finding nearby stores:', error);
    }
  };

  // Example: Get user profile
  const fetchUserProfile = async () => {
    if (!isAuthenticated) return;
    
    const response = await userService.getProfile(client);
    if (response.success && response.data) {
      setProfile(response.data);
    } else {
      console.error('Failed to fetch profile:', response.error);
    }
  };

  // Example: Get user orders
  const fetchUserOrders = async () => {
    if (!isAuthenticated) return;
    
    const response = await orderService.getUserOrders(client, {
      page: 1,
      limit: 10
    });
    
    if (response.success && response.data) {
      setOrders(response.data);
    } else {
      console.error('Failed to fetch orders:', response.error);
    }
  };

  // Example: Create an order
  const createOrder = async () => {
    if (!isAuthenticated) return;
    
    const orderData = {
      storeId: 'store-123',
      items: [
        {
          productId: 'product-456',
          quantity: 2,
          specialInstructions: 'Extra sauce please'
        }
      ],
      deliveryAddress: {
        street: '123 Main St',
        city: 'Toronto',
        state: 'ON',
        zipCode: 'M5V 3A8',
        instructions: 'Ring doorbell'
      },
      tip: 5.00
    };
    
    const response = await orderService.createOrder(client, orderData);
    if (response.success && response.data) {
      console.log('Order created:', response.data);
    } else {
      console.error('Failed to create order:', response.error);
    }
  };

  // Example: Search products
  const searchProducts = async (query: string) => {
    const response = await productService.searchProducts(client, query, {
      category: 'food',
      minPrice: 5,
      maxPrice: 50,
      pagination: { page: 1, limit: 20 }
    });
    
    if (response.success && response.data) {
      console.log('Search results:', response.data);
    }
  };

  // Example: Update user profile
  const updateProfile = async () => {
    if (!isAuthenticated) return;
    
    const response = await userService.updateProfile(client, {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890'
    });
    
    if (response.success && response.data) {
      setProfile(response.data);
    }
  };

  useEffect(() => {
    fetchProducts();
    if (isAuthenticated) {
      fetchUserProfile();
      fetchUserOrders();
    }
  }, [isAuthenticated]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>API Usage Examples</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Authentication Status</Text>
        <Text>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Products ({products.length})</Text>
        {products.map(product => (
          <Text key={product.id} style={styles.item}>
            {product.name} - ${product.discountedPrice}
          </Text>
        ))}
      </View>

      {profile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Profile</Text>
          <Text style={styles.item}>
            {profile.firstName} {profile.lastName}
          </Text>
          <Text style={styles.item}>{profile.email}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Orders ({orders.length})</Text>
        {orders.map(order => (
          <Text key={order.id} style={styles.item}>
            Order #{order.id.slice(-8)} - ${order.totalAmount}
          </Text>
        ))}
      </View>

      {userLocation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          <Text style={styles.item}>
            Lat: {userLocation.latitude}, Lng: {userLocation.longitude}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  item: {
    fontSize: 14,
    marginBottom: 5,
    paddingLeft: 10,
  },
});

// Example hook that uses the new API structure
export const useProductsWithApi = (category?: string) => {
  const { client } = useApi();
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    const response = await productService.getAllProducts(client, {
      productType: category,
      pagination: { page: 1, limit: 20 }
    });

    if (response.success && response.data) {
      setProducts(response.data);
    } else {
      setError(response.error || 'Failed to fetch products');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
};