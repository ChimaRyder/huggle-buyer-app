import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

interface EmptyCartProps {
  onBack: () => void;
}

const EmptyCart: React.FC<EmptyCartProps> = ({ onBack }) => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={64} color={colors.text.tertiary} />
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptyDescription}>
        Add some delicious items to your cart
      </Text>
      <TouchableOpacity 
        style={styles.continueButton} 
        onPress={onBack}
      >
        <Text style={styles.continueButtonText}>Continue Shopping</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 32,
  },
  continueButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});

export default EmptyCart;