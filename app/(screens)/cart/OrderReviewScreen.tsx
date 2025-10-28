import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import { useStoreContext } from '@/context/StoreContext';
import { useOrderContext } from '@/context/OrderContext';
import SafeImage from '@/components/common/SafeImage';
import { colors, spacing, typography } from '@/constants/theme';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  storeId?: string;
  storeName?: string;
}


const OrderReviewScreen = () => {
  const router = useRouter();
  const { storeId, productId, productName, productPrice, productImage, quantity, isBundle } = useLocalSearchParams<{ 
    storeId: string; 
    productId?: string;
    productName?: string;
    productPrice?: string;
    productImage?: string;
    quantity?: string;
    isBundle?: string;
  }>();
  const { selectedItems, selectedTotal, clearCart, items } = useCart();
  const { currentStore, fetchStoreById, isFetchingStore } = useStoreContext();
  const { createOrder, isCreating, error: orderError } = useOrderContext();

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderNotes, setOrderNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadOrderData();
    if (storeId) {
      fetchStoreById(storeId);
    }
  }, [storeId]);

  useEffect(() => {
  }, [orderItems]);

  const loadOrderData = () => {
    let items: OrderItem[] = [];
    
    if (productId && productName && productPrice && quantity) {
      // When coming from product page with specific product details
      const productQuantity = parseInt(quantity);
      const productPriceNum = parseFloat(productPrice);
      items = [{
        id: productId,
        productId: productId,
        productName: productName,
        productImage: productImage || '',
        quantity: productQuantity,
        unitPrice: productPriceNum,
        totalPrice: productPriceNum * productQuantity,
      }];
    } else {
      // When coming from cart, show all selected items
      items = selectedItems.map(item => ({
        id: item.id,
        productId: item.id,
        productName: item.name,
        productImage: item.image,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        storeId: item.storeId,
        storeName: item.storeName,
      }));
    }
    
    setOrderItems(items);
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleConfirmOrder = async () => {
    if (orderItems.length === 0) {
      Alert.alert('Error', 'No items to order');
      return;
    }

    try {
      // Create order request
      const orderRequest = {
        storeId: currentStore?.id || storeId || '',
        items: orderItems.map(item => {
          // Check if this is a bundle item
          // First check if we have direct bundle info from URL params
          let itemIsBundle = false;
          if (isBundle !== undefined) {
            // When coming from product page, use the isBundle parameter
            itemIsBundle = isBundle === 'true';
          } else {
            // When coming from cart, check cart item data
            const cartItem = selectedItems.find(ci => ci.id === item.productId);
            itemIsBundle = cartItem?.isBundle || false;
          }
          
          if (itemIsBundle) {
            return {
              bundleId: item.productId,
              quantity: item.quantity,
              itemType: "bundle" as const,
            };
          } else {
            return {
              productId: item.productId,
              quantity: item.quantity,
              itemType: "product" as const,
            };
          }
        }),
        notes: orderNotes || undefined,
      };


      // Create order via OrderContext
      const createdOrder = await createOrder(orderRequest);
      
      // Clear cart after successful order creation
      await clearCart();

      // Navigate to order confirmation with real order details
      const orderParams = {
        orderId: createdOrder.id || '',
        storeName: createdOrder.storeName || currentStore?.name || 'Unknown Store',
        totalAmount: createdOrder.totalAmount ? createdOrder.totalAmount.toString() : '0.00',
      };
      
      
      router.replace({
        pathname: '/(screens)/cart/OrderConfirmationScreen',
        params: orderParams,
      });
    } catch (error: any) {
      console.error('Error creating order:', error);
      Alert.alert(
        'Order Failed',
        error.message || 'There was an error creating your order. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const calculateSubtotal = () => {
    if (!orderItems.length) return 0;
    return orderItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const calculateTax = (subtotal: number) => {
    if (!subtotal) return 0;
    return subtotal * 0.12; // 12% VAT
  };

  const calculateDeliveryFee = () => {
    return 25.00; // Fixed delivery fee for now
  };

  const calculateSavedAmount = () => {
    // Mock saved amount - in real app this would be based on discounts/promos
    if (!orderItems.length) return 0;
    return orderItems.reduce((sum, item) => sum + ((item.unitPrice || 0) * 0.1 * (item.quantity || 0)), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const deliveryFee = calculateDeliveryFee();
    return subtotal + tax + deliveryFee;
  };

  // Group order items by store
  const groupOrderItemsByStore = () => {
    const groupedItems: { [storeId: string]: { storeName: string; items: OrderItem[] } } = {};
    
    orderItems.forEach(item => {
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

  // Render order items grouped by store
  const renderOrderItemsByStore = () => {
    const groupedItems = groupOrderItemsByStore();
    const storeIds = Object.keys(groupedItems);

    if (storeIds.length === 0) {
      return null;
    }

    if (storeIds.length === 1) {
      // Single store - render without store headers
      const storeData = groupedItems[storeIds[0]];
      return storeData.items.map((item) => (
        <View key={item.id} style={styles.orderItem}>
          <SafeImage 
            source={{ uri: item.productImage }}
            style={styles.productImage}
            placeholderColor={colors.background.secondary}
          />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.productName}</Text>
            <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            <Text style={styles.itemPrice}>₱{item.unitPrice.toFixed(2)} each</Text>
          </View>
          <Text style={styles.itemTotalPrice}>₱{item.totalPrice.toFixed(2)}</Text>
        </View>
      ));
    }

    // Multiple stores - render with store headers
    return storeIds.map((storeId) => {
      const storeData = groupedItems[storeId];
      const storeSubtotal = storeData.items.reduce((sum, item) => sum + item.totalPrice, 0);
      
      return (
        <View key={storeId} style={styles.storeItemsGroup}>
          {/* Store Header */}
          <View style={styles.storeItemsHeader}>
            <View style={styles.storeItemsHeaderContent}>
              <Ionicons name="storefront" size={16} color={colors.primary.main} />
              <Text style={styles.storeItemsName}>{storeData.storeName}</Text>
            </View>
            <Text style={styles.storeItemsSubtotal}>₱{storeSubtotal.toFixed(2)}</Text>
          </View>

          {/* Store Items */}
          {storeData.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <SafeImage 
                source={{ uri: item.productImage }}
                style={styles.productImage}
                placeholderColor={colors.background.secondary}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                <Text style={styles.itemPrice}>₱{item.unitPrice.toFixed(2)} each</Text>
              </View>
              <Text style={styles.itemTotalPrice}>₱{item.totalPrice.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      );
    });
  };


  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (orderItems.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Order</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="cart-outline" size={64} color={colors.text.secondary} />
          <Text style={styles.loadingText}>No items to review</Text>
          <Text style={[styles.loadingText, { fontSize: typography.fontSizes.md, marginTop: spacing.sm }]}>
            Please add items to your cart first
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Order</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Store Information */}
        {currentStore && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivering from</Text>
            <View style={styles.storeCard}>
              <SafeImage 
                source={{ uri: currentStore.profileImageUrl }}
                style={styles.storeImage}
                placeholderColor={colors.background.secondary}
              />
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{currentStore.name}</Text>
                <Text style={styles.storeAddress}>{currentStore.address}</Text>
                <Text style={styles.storeCity}>{currentStore.city}, {currentStore.province}</Text>
                <View style={styles.storeStatusContainer}>
                  <Ionicons 
                    name={currentStore.isOpen ? "time-outline" : "close-circle-outline"} 
                    size={16} 
                    color={currentStore.isOpen ? colors.success : colors.error} 
                  />
                  <Text style={[styles.storeStatus, { color: currentStore.isOpen ? colors.success : colors.error }]}>
                    {currentStore.isOpen ? "Open now" : "Closed"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Order</Text>
          {renderOrderItemsByStore()}
        </View>


        {/* Order Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Notes (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Add any special instructions..."
            placeholderTextColor={colors.text.tertiary}
            value={orderNotes}
            onChangeText={setOrderNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₱{calculateSubtotal().toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>₱{calculateDeliveryFee().toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (12%)</Text>
              <Text style={styles.summaryValue}>₱{calculateTax(calculateSubtotal()).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, styles.savedLabel]}>You Saved</Text>
              <Text style={[styles.summaryValue, styles.savedValue]}>-₱{calculateSavedAmount().toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₱{calculateTotal().toFixed(2)}</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Fixed Bottom Button */}
      {orderItems.length > 0 && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[
              styles.confirmButton, 
              isCreating && styles.confirmButtonDisabled
            ]} 
            onPress={handleConfirmOrder}
            disabled={isCreating}
          >
            {isCreating ? (
              <View style={styles.loadingButtonContent}>
                <ActivityIndicator size="small" color={colors.text.inverse} />
                <Text style={styles.confirmButtonText}>Creating Order...</Text>
              </View>
            ) : (
              <Text style={styles.confirmButtonText}>
                Order Now • ₱{(calculateTotal() || 0).toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSizes.lg,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPlaceholder: {
    width: 24,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100, // Make room for fixed button
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  storeCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: spacing.md,
  },
  storeInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  storeName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  storeAddress: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
  },
  storeCity: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  storeStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  storeStatus: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.secondary,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  itemQuantity: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  itemPrice: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  itemTotalPrice: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  textInput: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.primary,
    padding: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  summaryCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
  },
  savedLabel: {
    color: colors.success,
    fontWeight: typography.fontWeights.medium,
  },
  savedValue: {
    color: colors.success,
    fontWeight: typography.fontWeights.semibold,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
  },
  totalLabel: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  bottomContainer: {
    backgroundColor: colors.background.primary,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    minHeight: 80,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  confirmButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.background.disabled,
  },
  confirmButtonText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.inverse,
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  storeItemsGroup: {
    marginBottom: spacing.md,
  },
  storeItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  storeItemsHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  storeItemsName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  storeItemsSubtotal: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary.main,
  },
});

export default OrderReviewScreen;