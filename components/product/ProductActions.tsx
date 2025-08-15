import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Simple theme constants since we can't import them
const colors = {
  primary: '#548C2F',
  white: '#FFFFFF',
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
  },
  border: {
    primary: 'rgba(0, 0, 0, 0.08)',
  },
  error: '#EF4444',
};

const spacing = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

const typography = {
  fontSizes: {
    md: 15,
    lg: 17,
    xl: 19,
    xxl: 22,
  },
  fontWeights: {
    medium: '500',
    bold: '700',
  },
};

const radii = {
  lg: 8,
  xl: 16,
};

const shadows = {
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
};

const { height: screenHeight } = Dimensions.get('window');

interface ProductActionsProps {
  onAddToCart: (quantity: number) => void;
  onOrderNow: (quantity: number) => void;
  isExpired?: boolean;
  isOutOfStock?: boolean;
  maxQuantity?: number;
  stock?: number;
}

const AnimatedTouchableOpacity = Platform.OS === 'web' 
  ? TouchableOpacity 
  : Animated.createAnimatedComponent(TouchableOpacity);

const ProductActions: React.FC<ProductActionsProps> = ({
  onAddToCart,
  onOrderNow,
  isExpired = false,
  isOutOfStock = false,
  maxQuantity = 10,
  stock,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [actionType, setActionType] = useState<'cart' | 'order'>('cart');

  const handleQuantityChange = (increment: boolean) => {
    setQuantity(prev => {
      const newValue = increment ? prev + 1 : prev - 1;
      return Math.min(Math.max(newValue, 1), maxQuantity);
    });
  };

  const isDisabled = isExpired || isOutOfStock;

  const getDisabledMessage = () => {
    if (isExpired) return 'Product Expired';
    if (isOutOfStock) return 'Out of Stock';
    return '';
  };

  if (isDisabled) {
    return (
      <LinearGradient
        colors={['rgba(239, 68, 68, 0.1)', 'rgba(220, 38, 38, 0.05)']}
        style={styles.disabledContainer}
      >
        <View style={styles.disabledContent}>
          <Ionicons name="alert-circle" size={24} color={colors.error} />
          <Text style={styles.disabledText}>
            {getDisabledMessage()}
          </Text>
        </View>
      </LinearGradient>
    );
  }

  const handleAddToCart = () => {
    setActionType('cart');
    setShowQuantityModal(true);
  };

  const handleOrderNow = () => {
    setActionType('order');
    setShowQuantityModal(true);
  };

  const handleConfirmAction = () => {
    if (actionType === 'cart') {
      onAddToCart(quantity);
    } else {
      onOrderNow(quantity);
    }
    setShowQuantityModal(false);
  };

  const closeModal = () => {
    setShowQuantityModal(false);
  };

  return (
    <>
      {/* Bottom Sheet Modal */}
      <Modal
        visible={showQuantityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground} 
            onPress={closeModal}
            activeOpacity={1}
          />
          <View style={styles.bottomSheet}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.98)', 'rgba(249, 250, 251, 0.95)']}
              style={styles.sheetContent}
            >
              {/* Handle Bar */}
              <View style={styles.handleBar} />
              
              {/* Header */}
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>
                  {actionType === 'cart' ? 'Add to Cart' : 'Order Now'}
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* Stock Information */}
              {stock !== undefined && (
                <View style={[styles.stockInfo, stock === 0 ? styles.outOfStock : styles.inStock]}>
                  <Ionicons 
                    name={stock === 0 ? "warning" : "checkmark-circle"} 
                    size={18} 
                    color={colors.white} 
                  />
                  <Text style={styles.stockText}>
                    {stock === 0 ? 'Out of Stock' : `${stock} items available`}
                  </Text>
                </View>
              )}

              {/* Quantity Selector */}
              <View style={styles.quantitySection}>
                <Text style={styles.quantityLabel}>Select Quantity</Text>
                <View style={styles.quantitySelector}>
                  <TouchableOpacity
                    style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                    onPress={() => handleQuantityChange(false)}
                    disabled={quantity <= 1}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={quantity <= 1 ? ['transparent', 'transparent'] : [colors.white, 'rgba(249, 250, 251, 0.9)']}
                      style={styles.quantityButtonGradient}
                    >
                      <Ionicons 
                        name="remove" 
                        size={24} 
                        color={quantity <= 1 ? colors.text.secondary : colors.text.primary} 
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <View style={styles.quantityDisplay}>
                    <Text style={styles.quantityText}>{quantity}</Text>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.quantityButton, quantity >= maxQuantity && styles.quantityButtonDisabled]}
                    onPress={() => handleQuantityChange(true)}
                    disabled={quantity >= maxQuantity}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={quantity >= maxQuantity ? ['transparent', 'transparent'] : [colors.white, 'rgba(249, 250, 251, 0.9)']}
                      style={styles.quantityButtonGradient}
                    >
                      <Ionicons 
                        name="add" 
                        size={24} 
                        color={quantity >= maxQuantity ? colors.text.secondary : colors.text.primary} 
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Button */}
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleConfirmAction}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primary + 'DD']}
                  style={styles.confirmButtonGradient}
                >
                  <Ionicons 
                    name={actionType === 'cart' ? "bag-add" : "flash"} 
                    size={20} 
                    color={colors.white} 
                  />
                  <Text style={styles.confirmButtonText}>
                    {actionType === 'cart' ? `Add ${quantity} to Cart` : `Order ${quantity} Now`}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Fixed Action Buttons */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.98)', 'rgba(249, 250, 251, 0.95)']}
        style={styles.container}
      >
        <View style={styles.buttonsContainer}>
          <AnimatedTouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.primary + 'DD']}
              style={styles.buttonGradient}
            >
              <Ionicons name="bag-add-outline" size={20} color={colors.white} />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </LinearGradient>
          </AnimatedTouchableOpacity>

          <AnimatedTouchableOpacity
            style={styles.orderNowButton}
            onPress={handleOrderNow}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.white, 'rgba(255, 255, 255, 0.9)']}
              style={styles.buttonGradient}
            >
              <Ionicons name="flash" size={18} color={colors.primary} />
              <Text style={styles.orderNowText}>Order Now</Text>
            </LinearGradient>
          </AnimatedTouchableOpacity>
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary || 'rgba(0, 0, 0, 0.08)',
    ...shadows.md,
  },
  disabledContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary || 'rgba(0, 0, 0, 0.08)',
    ...shadows.lg,
  },
  disabledContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  disabledText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.error || '#FF6B6B',
    fontFamily: 'Poppins-Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
  },
  bottomSheet: {
    height: screenHeight * 0.5,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.xl,
  },
  sheetContent: {
    flex: 1,
    padding: spacing.xl,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.text.secondary + '40',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  sheetTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    fontFamily: 'Poppins-Bold',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.xl,
  },
  outOfStock: {
    backgroundColor: colors.error,
  },
  inStock: {
    backgroundColor: colors.primary,
  },
  stockText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.white,
    marginLeft: spacing.sm,
    fontFamily: 'Poppins-Medium',
  },
  quantitySection: {
    marginBottom: spacing.xl,
  },
  quantityLabel: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
    fontFamily: 'Poppins-Medium',
    marginBottom: spacing.lg,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.md,
    ...shadows.md,
  },
  quantityButton: {
    width: 50,
    height: 50,
    borderRadius: radii.xl,
    ...shadows.sm,
  },
  quantityButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radii.lg,
  },
  quantityButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  quantityDisplay: {
    backgroundColor: colors.primary + '15',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.xl,
    minWidth: 80,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  addToCartButton: {
    flex: 1,
    height: 60,
    borderRadius: radii.xl,
    ...shadows.md,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radii.xl,
    gap: spacing.sm,
  },
  addToCartText: {
    color: colors.white,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    fontFamily: 'Poppins-Medium',
  },
  orderNowButton: {
    flex: 1,
    height: 60,
    borderRadius: radii.xl,
    borderWidth: 2,
    borderColor: colors.primary,
    ...shadows.md,
  },
  orderNowText: {
    color: colors.primary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    fontFamily: 'Poppins-Medium',
  },
  confirmButton: {
    borderRadius: radii.xl,
    ...shadows.md,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    fontFamily: 'Poppins-Bold',
  },
});

export default ProductActions;