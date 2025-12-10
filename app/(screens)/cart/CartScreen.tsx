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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';

import CartItemCard from '@/components/cart/CartItemCard';
import {
  CartHeader,
  CartSummary,
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

    // Check if selected items are from different stores
    const uniqueStoreIds = new Set(selectedItems.map(item => item.storeId));
    if (uniqueStoreIds.size > 1) {
      const storeNames = Array.from(uniqueStoreIds).map(storeId => {
        const item = selectedItems.find(item => item.storeId === storeId);
        return item?.storeName || 'Unknown Store';
      });

      Alert.alert(
        'Mixed Store Order Not Allowed',
        `You can only order from one store at a time. Your selected items are from: ${storeNames.join(', ')}. Please select items from only one store.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // For simplicity, use the first selected item's store
    const storeId = selectedItems[0]?.storeId || 'unknown-store';

    // Navigate to OrderReviewScreen
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

  // Check if checkout should be disabled due to mixed stores
  const uniqueStoreIds = new Set(selectedItems.map(item => item.storeId));
  const hasMixedStores = uniqueStoreIds.size > 1;
  const isCheckoutDisabled = hasMixedStores;
  const checkoutDisabledReason = hasMixedStores
    ? `Items from ${uniqueStoreIds.size} different stores selected. Please select items from only one store.`
    : undefined;

  // Group items by store
  const groupItemsByStore = () => {
    const groupedItems: { [storeId: string]: { storeName: string; items: typeof items } } = {};

    items.forEach(item => {

      const storeId = item.storeId || 'unknown';
      const storeName = item.storeName || 'Unknown Store';

      if (!groupedItems[storeId]) {
        groupedItems[storeId] = {
          storeName,
          items: []
        };
      }

      groupedItems[storeId].items.push(item);
    });

    return groupedItems;
  };

  // Calculate subtotal for a specific store
  const getStoreSubtotal = (storeItems: typeof items) => {
    return storeItems
      .filter(item => item.selected)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Render items grouped by store
  const renderItemsByStore = () => {
    const groupedItems = groupItemsByStore();
    const storeIds = Object.keys(groupedItems);

    if (storeIds.length === 0) {
      return null;
    }

    return storeIds.map((storeId) => {
      const storeData = groupedItems[storeId];
      const storeSubtotal = getStoreSubtotal(storeData.items);
      const hasSelectedItems = storeData.items.some(item => item.selected);

      return (
        <View key={storeId} style={styles.storeSection}>
          {/* Store Header */}
          <View style={styles.storeHeader}>
            <View style={styles.storeHeaderContent}>
              {storeData.items[0]?.storeProfileImage ? (
                <Image
                  source={{ uri: storeData.items[0].storeProfileImage }}
                  style={styles.storeProfileImage}
                />
              ) : (
                <View style={styles.storeIcon}>
                  <Ionicons name="storefront" size={20} color={colors.primary.main} />
                </View>
              )}
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{storeData.storeName}</Text>
                <Text style={styles.storeItemsCount}>
                  {storeData.items.length} item{storeData.items.length > 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            {hasSelectedItems && (
              <View style={styles.storeSubtotalContainer}>
                <Text style={styles.storeSubtotalLabel}>Subtotal</Text>
                <Text style={styles.storeSubtotal}>₱{storeSubtotal.toFixed(2)}</Text>
              </View>
            )}
          </View>

          {/* Store Items */}
          <View style={styles.storeItems}>
            {storeData.items.map((item) => (
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
        </View>
      );
    });
  };


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
                ₱{selectedTotal.toFixed(2)}
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

        {/* Mixed Store Warning */}
        {hasMixedStores && (
          <View style={styles.warningBanner}>
            <Ionicons name="information-circle" size={20} color="#FF6B6B" />
            <Text style={styles.warningText}>
              You have items from {uniqueStoreIds.size} different stores. You can only order from one store at a time.
            </Text>
          </View>
        )}

        <View style={styles.itemsContainer}>
          {renderItemsByStore()}
        </View>
      </ScrollView>

      <View style={styles.summaryContainer}>
        <CartSummary
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          tax={tax}
          total={totalWithFees}
          onCheckout={handleCheckout}
          hasItems={selectedItems.length > 0}
          isDisabled={isCheckoutDisabled}
          disabledReason={checkoutDisabledReason}
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
    color: colors.primary.main,
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
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
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
  storeSection: {
    marginBottom: 24,
  },
  storeHeader: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  storeHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storeProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  storeItemsCount: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  storeSubtotalContainer: {
    alignItems: 'flex-end',
  },
  storeSubtotalLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  storeSubtotal: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary.main,
  },
  storeItems: {
    paddingLeft: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginLeft: 8,
    flex: 1,
  },
});

export default CartScreen;
