import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '@/constants/theme';

interface CartSummaryProps {
  total: number;
  onCheckout: () => void;
  hasItems: boolean;
  isDisabled?: boolean | undefined;
  disabledReason?: string | undefined;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  total,
  onCheckout,
  hasItems,
  isDisabled = false,
  disabledReason
}) => {
  const isButtonDisabled = !hasItems || isDisabled;

  return (
    <View style={styles.summaryContainer}>
      {/* Total */}
      <View style={styles.totalRow}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalHint}>Including all taxes & fees</Text>
        </View>
        <Text style={styles.totalValue}>₱{total.toFixed(2)}</Text>
      </View>

      {/* Disabled Reason */}
      {disabledReason && (
        <View style={styles.disabledReasonContainer}>
          <Ionicons name="alert-circle" size={18} color="#FF6B6B" />
          <Text style={styles.disabledReasonText}>{disabledReason}</Text>
        </View>
      )}

      {/* Checkout Button */}
      <TouchableOpacity
        onPress={onCheckout}
        disabled={isButtonDisabled}
        activeOpacity={0.8}
        style={styles.checkoutButtonContainer}
      >
        {isButtonDisabled ? (
          <View style={styles.disabledButton}>
            <Text style={styles.disabledButtonText}>
              {!hasItems ? 'Select Items' : 'Cannot Checkout'}
            </Text>
          </View>
        ) : (
          <LinearGradient
            colors={[colors.primary.main, colors.primary.dark || '#3D7A1E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.checkoutButton}
          >
            <Ionicons name="cart-outline" size={22} color={colors.text.inverse} />
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.text.inverse} />
          </LinearGradient>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  totalLabel: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  totalHint: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  totalValue: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary.main,
  },
  checkoutButtonContainer: {
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  checkoutButtonText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.inverse,
  },
  disabledButton: {
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.xl,
  },
  disabledButtonText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.tertiary,
  },
  disabledReasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  disabledReasonText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: '#FF6B6B',
  },
});

export default CartSummary;