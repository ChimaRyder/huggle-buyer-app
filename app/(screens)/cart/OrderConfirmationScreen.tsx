import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

const OrderConfirmationScreen = () => {
  const router = useRouter();

  const handleBackToHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          </View>
          
          <Text style={styles.title}>Order Placed Successfully!</Text>
          <Text style={styles.description}>
            Your order has been placed and will be ready for pickup soon. 
            You'll receive a notification when your order is ready.
          </Text>
          
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Order Number</Text>
            <Text style={styles.orderValue}>#HGL-2023-001</Text>
            
            <Text style={styles.orderLabel}>Estimated Pickup Time</Text>
            <Text style={styles.orderValue}>25-35 minutes</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.button} onPress={handleBackToHome}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  orderInfo: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  orderLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  orderValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.success,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});

export default OrderConfirmationScreen;