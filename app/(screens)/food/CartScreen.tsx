import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
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

const CartScreen = () => {
  const router = useRouter();
  const { 
    items, 
    total, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    setSpecialInstructions 
  } = useCart();
  
  const [promoCode, setPromoCode] = useState('');
  const [isEditingInstructions, setIsEditingInstructions] = useState<string | null>(null);
  const [instructionText, setInstructionText] = useState('');

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout');
      return;
    }
    router.push('/screens/food/OrderConfirmationScreen');
  };

  const handleIncrease = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
    }
  };

  const handleDecrease = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1);
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
        { text: 'Remove', style: 'destructive', onPress: () => removeItem(id) },
      ]
    );
  };

  const handleUpdateInstructions = (id: string, currentInstructions: string = '') => {
    const item = items.find(item => item.id === id);
    if (item) {
      setIsEditingInstructions(id);
      setInstructionText(currentInstructions);
    }
  };

  const handleSaveInstructions = () => {
    if (isEditingInstructions) {
      setSpecialInstructions(isEditingInstructions, instructionText);
      setIsEditingInstructions(null);
      setInstructionText('');
    }
  };

  const handleCancelInstructions = () => {
    setIsEditingInstructions(null);
    setInstructionText('');
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

  // Calculate cart totals
  const subtotal = total;
  const deliveryFee = subtotal > 0 ? 2.99 : 0;
  const tax = subtotal * 0.08;
  const totalWithFees = subtotal + deliveryFee + tax;

  // Render instruction editor modal
  if (isEditingInstructions) {
    const item = items.find(item => item.id === isEditingInstructions);
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancelInstructions} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Special Instructions</Text>
          <TouchableOpacity onPress={handleSaveInstructions} style={styles.headerButton}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsLabel}>Special Instructions</Text>
          <Text style={styles.itemName}>{item?.name}</Text>
          <TextInput
            style={styles.instructionsInput}
            placeholder="Any special requests, allergies, or delivery instructions?"
            value={instructionText}
            onChangeText={setInstructionText}
            multiline
          />
          <Text style={styles.instructionsHint}>
            These instructions will be sent directly to the restaurant
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render empty cart
  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <CartHeader onBack={() => router.back()} title="Your Cart" />
        <EmptyCart onBack={() => router.back()} />
      </SafeAreaView>
    );
  }

  // Render cart with items
  return (
    <SafeAreaView style={styles.safeArea}>
      <CartHeader onBack={() => router.back()} title="Your Cart" />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.itemsContainer}>
          {items.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onIncrease={() => handleIncrease(item.id)}
              onDecrease={() => handleDecrease(item.id)}
              onRemove={() => handleRemoveItem(item.id)}
              onUpdateInstructions={() => handleUpdateInstructions(item.id, item.specialInstructions || '')}
            />
          ))}
        </View>
        
        <PromoCodeInput 
          value={promoCode} 
          onChangeText={setPromoCode} 
          onApply={handleApplyPromo} 
        />
      </ScrollView>
      
      <CartSummary
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        tax={tax}
        total={totalWithFees}
        onCheckout={handleCheckout}
        hasItems={items.length > 0}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  container: {
    flex: 1,
  },
  itemsContainer: {
    padding: 16,
  },
  instructionsContainer: {
    flex: 1,
    padding: 16,
  },
  instructionsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  itemName: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  instructionsInput: {
    borderWidth: 1,
    borderColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    height: 100,
    marginBottom: 16,
  },
  instructionsHint: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
});

export default CartScreen;