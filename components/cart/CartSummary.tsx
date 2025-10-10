import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors } from '@/constants/theme';

interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  onCheckout: () => void;
  hasItems: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({ 
  subtotal, 
  deliveryFee, 
  tax, 
  total, 
  onCheckout, 
  hasItems,
  isDisabled = false,
  disabledReason
}) => {
  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal</Text>
        <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Delivery Fee</Text>
        <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Tax</Text>
        <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
      </View>
      
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
      </View>
      
      {disabledReason && (
        <View style={styles.disabledReasonContainer}>
          <Text style={styles.disabledReasonText}>{disabledReason}</Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={[
          styles.checkoutButton, 
          (!hasItems || isDisabled) && styles.disabledButton
        ]} 
        onPress={onCheckout}
        disabled={!hasItems || isDisabled}
      >
        <Text style={styles.checkoutButtonText}>
          {isDisabled ? 'Cannot Checkout' : 'Checkout'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    backgroundColor: colors.background.primary,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.text.tertiary,
  },
  summaryValue: {
    fontSize: 16,
    color: colors.text.primary,
  },
  totalRow: {
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  checkoutButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.text.tertiary,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  disabledReasonContainer: {
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  disabledReasonText: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
  },
});

export default CartSummary;