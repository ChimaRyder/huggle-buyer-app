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
import { useApi } from '@/context/ApiContext';
import { useStoreContext } from '@/context/StoreContext';
import { OrderService, CreateOrderRequest } from '@/services/orderService';
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
}


const OrderReviewScreen = () => {
  const router = useRouter();
  const { storeId, productId, productName, productPrice, productImage, quantity } = useLocalSearchParams<{ 
    storeId: string; 
    productId?: string;
    productName?: string;
    productPrice?: string;
    productImage?: string;
    quantity?: string;
  }>();
  const { selectedItems, selectedTotal, clearCart, items } = useCart();
  const { client } = useApi();
  const { currentStore, fetchStoreById, isFetchingStore } = useStoreContext();
  const orderService = new OrderService(client);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  useEffect(() => {
    loadOrderData();
    if (storeId) {
      fetchStoreById(storeId);
    }
  }, [storeId]);

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

    setIsCreatingOrder(true);
    try {
      // Create order request
      const orderRequest: CreateOrderRequest = {
        storeId: storeInfo?.id || storeId || '',
        items: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        deliveryAddress: deliveryAddress || undefined,
        notes: orderNotes || undefined,
      };

      // Create order via API
      const response = await orderService.createOrder(orderRequest);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create order');
      }

      const createdOrder = response.data;
      
      // Clear cart after successful order creation
      await clearCart();

      // Navigate to order confirmation with real order details
      router.replace({
        pathname: '/(screens)/cart/OrderConfirmationScreen',
        params: {
          orderId: createdOrder.id,
          storeName: createdOrder.storeName || storeInfo?.name || 'Unknown Store',
          totalAmount: createdOrder.totalAmount.toString(),
          estimatedTime: '25-35 minutes',
        },
      });
    } catch (error: any) {
      console.error('Error creating order:', error);
      Alert.alert(
        'Order Failed',
        error.message || 'There was an error creating your order. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.12; // 12% VAT
  };

  const calculateDeliveryFee = () => {
    return 25.00; // Fixed delivery fee for now
  };

  const calculateSavedAmount = () => {
    // Mock saved amount - in real app this would be based on discounts/promos
    return orderItems.reduce((sum, item) => sum + (item.unitPrice * 0.1 * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const deliveryFee = calculateDeliveryFee();
    return subtotal + tax + deliveryFee;
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

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
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
          {orderItems.map((item) => (
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

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.confirmButton, isCreatingOrder && styles.confirmButtonDisabled]} 
          onPress={handleConfirmOrder}
          disabled={isCreatingOrder}
        >
          {isCreatingOrder ? (
            <View style={styles.loadingButtonContent}>
              <ActivityIndicator size="small" color={colors.text.inverse} />
              <Text style={styles.confirmButtonText}>Creating Order...</Text>
            </View>
          ) : (
            <Text style={styles.confirmButtonText}>Order Now • ₱{calculateTotal().toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </View>
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
    padding: spacing.md,
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
  bottomSpacing: {
    height: 100,
  },
  bottomContainer: {
    backgroundColor: colors.background.primary,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default OrderReviewScreen;