import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';

import CartItemCard from '@/components/cart/CartItemCard';
import {
  CartHeader,
  CartSummary,
  PromoCodeInput,
  EmptyCart
} from '@/components/cart';
import { colors } from '@/constants/theme';
// TODO: Remove mock data loading - cart data should come from CartContext API integration

const CartScreen = () => {
  const router = useRouter();
  const { 
    items, 
    total, 
    removeItem, 
    updateQuantity, 
    clearCart,
    addItem,
    selectedItems,
    selectedTotal,
    toggleItemSelection,
    selectAllItems,
    hasExpiredItems,
    activeItems,
    expiredItems,
    refreshCart,
    isLoading
  } = useCart();
  
  const [promoCode, setPromoCode] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // TODO: Remove mock data loading - cart data should come from CartContext with API integration
  // useEffect removed - cart data should be managed by CartContext and persisted via API

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshCart();
    } catch (error) {
      console.error('Error refreshing cart:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('No Items Selected', 'Please select items to checkout');
      return;
    }
    
    // Simple client-side validation
    if (hasExpiredItems) {
      const hasSelectedExpiredItems = expiredItems.some(item => item.selected);
      if (hasSelectedExpiredItems) {
        Alert.alert(
          'Cart Validation Failed',
          'Some selected items in your cart are no longer available. Please deselect them and try again.'
        );
        return;
      }
    }

    // Determine the store ID from selected items
    // Assuming all selected items belong to the same store
    const storeId = selectedItems[0]?.storeId || 'unknown-store';
      
    // Navigate to OrderReviewScreen instead of directly to confirmation
    router.push({
      pathname: '/(screens)/cart/OrderReviewScreen',
      params: { storeId },
    });
  };

  const handleIncrease = async (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      await updateQuantity(id, item.quantity + 1);
    }
  };

  const handleDecrease = async (id: string) => {
    const item = items.find(item => item.id === id);
    if (item && item.quantity > 1) {
      await updateQuantity(id, item.quantity - 1);
    } else if (item && item.quantity === 1) {
      handleRemoveItem(id);
    }
  };

  const handleRemoveItem = (id: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: async () => await removeItem(id) },
      ]
    );
  };


  const handleApplyPromo = () => {
    // In a real app, this would validate and apply the promo code
    Alert.alert('Promo Code', `Applied promo code: ${promoCode}`);
    setPromoCode('');
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to clear your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearCart },
      ]
    );
  };

  // Helper function to check if an item is unavailable
  const isItemUnavailable = (item: any) => {
    const isExpired = item.expiresAt ? new Date(item.expiresAt) <= new Date() : false;
    const isInactive = item.isActive === false;
    return isExpired || isInactive;
  };

  // Helper function to get available items only
  const getAvailableItems = () => {
    return items.filter(item => !isItemUnavailable(item));
  };

  // Helper function to check if all available items are selected
  const areAllAvailableItemsSelected = () => {
    const availableItems = getAvailableItems();
    return availableItems.length > 0 && availableItems.every(item => item.selected);
  };

  // Calculate cart totals based on selected items
  const subtotal = selectedTotal;
  const deliveryFee = subtotal > 0 ? 2.99 : 0;
  const tax = subtotal * 0.08;
  const totalWithFees = subtotal + deliveryFee + tax;


  // Render empty cart
  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <CartHeader onBack={() => router.back()} title="Your Cart" />
        <EmptyCart onBack={() => router.back()} />
      </SafeAreaView>
    );
  }

  // Render cart with items
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <CartHeader onBack={() => router.back()} title={`Your Cart (${items.length})`} />
      
      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      )}
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary.main]}
            tintColor={colors.primary.main}
          />
        }
      >
        {/* Selection Controls */}
        <View style={styles.selectionControls}>
          <TouchableOpacity 
            style={styles.selectAllButton}
            onPress={() => {
              const allAvailableSelected = areAllAvailableItemsSelected();
              
              // Toggle selection for all items (including expired ones for deselection)
              items.forEach(item => {
                const isUnavailable = isItemUnavailable(item);
                
                if (!allAvailableSelected) {
                  // Selecting all - only select available items that aren't selected
                  if (!isUnavailable && !item.selected) {
                    toggleItemSelection(item.id);
                  }
                } else {
                  // Deselecting all - deselect all items that are currently selected
                  if (item.selected) {
                    toggleItemSelection(item.id);
                  }
                }
              });
            }}
          >
            <View style={[styles.selectAllCheckbox, areAllAvailableItemsSelected() && styles.selectAllCheckboxSelected]}>
              {areAllAvailableItemsSelected() && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
            <Text style={styles.selectAllText}>
              {areAllAvailableItemsSelected() ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
          <View style={styles.selectionInfoContainer}>
            <Text style={styles.selectionInfo}>
              {selectedItems.length} of {items.length} selected
            </Text>
            {selectedItems.length > 0 && (
              <Text style={styles.selectedTotalText}>
                ${selectedTotal.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
        
        {/* Expired Items Warning */}
        {hasExpiredItems && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color="#FF6B6B" />
            <Text style={styles.warningText}>
              {expiredItems.length} item{expiredItems.length > 1 ? 's' : ''} unavailable for checkout
            </Text>
          </View>
        )}
        
        <View style={styles.itemsContainer}>
          {items.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onIncrease={() => handleIncrease(item.id)}
              onDecrease={() => handleDecrease(item.id)}
              onRemove={() => handleRemoveItem(item.id)}
              onToggleSelection={() => toggleItemSelection(item.id)}
            />
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.summaryContainer}>
        <PromoCodeInput 
          value={promoCode} 
          onChangeText={setPromoCode} 
          onApply={handleApplyPromo} 
        />
        <CartSummary
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          tax={tax}
          total={totalWithFees}
          onCheckout={handleCheckout}
          hasItems={selectedItems.length > 0}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.tertiary, // Light gray background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  container: {
    flex: 1,
  },
  itemsContainer: {
    padding: 16,
  },
  summaryContainer: {
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  selectionControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  selectAllCheckboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  selectionInfoContainer: {
    alignItems: 'flex-end',
  },
  selectionInfo: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  selectedTotalText: {
    fontSize: 12,
    color: colors.primary.main,
    fontWeight: '600',
    marginTop: 2,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  unavailableText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginLeft: 8,
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default CartScreen;