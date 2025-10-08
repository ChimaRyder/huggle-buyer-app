import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/constants/theme';

const OrderConfirmationScreen = () => {
  const router = useRouter();
  const { 
    orderId, 
    storeName, 
    totalAmount,
    isMultiStoreCheckout,
    remainingStores
  } = useLocalSearchParams<{
    orderId?: string;
    storeName?: string;
    totalAmount?: string;
    isMultiStoreCheckout?: string;
    remainingStores?: string;
  }>();

  console.log('🔍 OrderConfirmationScreen: Received params:', {
    orderId,
    storeName,
    totalAmount
  });

  const handleBackToHome = () => {
    router.replace('/(tabs)');
  };

  const handleContinueToNextStore = () => {
    // Navigate back to cart to continue with remaining stores
    router.replace('/(screens)/cart/CartScreen');
  };

  const handleViewOrder = () => {
    router.push({
      pathname: '/(screens)/order/OrderDetails',
      params: { orderId: orderId || 'unknown' },
    });
  };

  const handleTrackOrder = () => {
    router.push('/(screens)/order/Orders');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          </View>
          
          <Text style={styles.title}>
            {isMultiStoreCheckout === 'true' ? 'Order Placed for Store!' : 'Order Placed Successfully!'}
          </Text>
          <Text style={styles.description}>
            Your order has been placed and sent to {storeName || 'the restaurant'}. 
            {isMultiStoreCheckout === 'true' && remainingStores ? 
              ` You still have items from other stores in your cart.` :
              ` You'll receive notifications about your order status updates.`
            }
          </Text>
          
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Order Number</Text>
            <Text style={styles.orderValue}>#{orderId ? orderId.substring(0, 8).toUpperCase() : 'HGL-UNKNOWN'}</Text>
            
            <Text style={styles.orderLabel}>Restaurant</Text>
            <Text style={styles.orderValue}>{storeName || 'Unknown Restaurant'}</Text>
            
            <Text style={styles.orderLabel}>Total Amount</Text>
            <Text style={styles.orderValue}>₱{totalAmount || '0.00'}</Text>
            
            <Text style={styles.orderLabel}>Status</Text>
            <Text style={[styles.orderValue, styles.statusPending]}>Pending Confirmation</Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleViewOrder}>
            <Text style={styles.secondaryButtonText}>View Order Details</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleTrackOrder}>
            <Text style={styles.secondaryButtonText}>Track Order</Text>
          </TouchableOpacity>
          
          {isMultiStoreCheckout === 'true' && remainingStores ? (
            <TouchableOpacity style={styles.primaryButton} onPress={handleContinueToNextStore}>
              <Text style={styles.primaryButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryButton} onPress={handleBackToHome}>
              <Text style={styles.primaryButtonText}>Back to Home</Text>
            </TouchableOpacity>
          )}
          
          {isMultiStoreCheckout === 'true' && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handleBackToHome}>
              <Text style={styles.secondaryButtonText}>Done Shopping</Text>
            </TouchableOpacity>
          )}
        </View>
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
    padding: spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSizes.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 24,
    paddingHorizontal: spacing.sm,
  },
  orderInfo: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  orderLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  orderValue: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statusPending: {
    color: colors.warning,
    marginBottom: 0,
  },
  buttonContainer: {
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.inverse,
  },
  secondaryButton: {
    backgroundColor: colors.background.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  secondaryButtonText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.primary.main,
  },
});

export default OrderConfirmationScreen;