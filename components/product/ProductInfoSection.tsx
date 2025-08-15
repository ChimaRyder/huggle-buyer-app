import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii, shadows } from '@/constants/theme';

interface ProductInfoSectionProps {
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  expirationDate?: string;
}

const ProductInfoSection: React.FC<ProductInfoSectionProps> = ({
  name,
  price,
  originalPrice,
  description,
  expirationDate,
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const formatPrice = (amount: number) => `$${amount.toFixed(2)}`;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isExpired = () => {
    if (!expirationDate) return false;
    const now = new Date();
    const exp = new Date(expirationDate);
    return exp < now;
  };

  // Check if description needs truncation (150 characters)
  const shouldTruncateDescription = () => {
    return description.trim().length > 150;
  };

  const getTruncatedDescription = () => {
    if (!shouldTruncateDescription()) return description;
    return description.trim().substring(0, 150) + '...';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.9)', 'rgba(249, 250, 251, 0.9)']}
        style={styles.infoCard}
      >
        {/* Product Name */}
        <Text style={styles.productName} numberOfLines={2}>
          {name}
        </Text>

        {/* Pricing Section */}
        <View style={styles.pricingContainer}>
          <Text style={styles.currentPrice}>
            {formatPrice(price)}
          </Text>
          
          {hasDiscount && (
            <View style={styles.discountRow}>
              <Text style={styles.originalPrice}>
                {formatPrice(originalPrice)}
              </Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  {discountPercentage}% OFF
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Expiry Badge */}
        {expirationDate && (
          <View style={[styles.expiryBadge, isExpired() ? styles.expiredBadge : styles.validBadge]}>
            <Ionicons 
              name={isExpired() ? "warning" : "time"} 
              size={14} 
              color={colors.white} 
            />
            <Text style={styles.expiryText}>
              {isExpired() ? 'Expired' : `Until ${formatDate(expirationDate)}`}
            </Text>
          </View>
        )}

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>About this product</Text>
          <TouchableOpacity
            onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            activeOpacity={0.8}
            disabled={!shouldTruncateDescription()}
          >
            <Text style={styles.description}>
              {isDescriptionExpanded ? description : getTruncatedDescription()}
            </Text>
            {shouldTruncateDescription() && (
              <Text style={styles.readMoreText}>
                {isDescriptionExpanded ? 'Show less' : 'Read more'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  infoCard: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  nameContainer: {
    marginBottom: spacing.md,
  },
  productName: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    lineHeight: 32,
    marginBottom: spacing.sm,
    fontFamily: 'Poppins-Bold',
  },
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  expiredBadge: {
    backgroundColor: colors.error,
  },
  validBadge: {
    backgroundColor: colors.primary,
  },
  expiryText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.white,
    marginLeft: spacing.xs,
    fontFamily: 'Poppins-Medium',
  },
  pricingContainer: {
    backgroundColor: colors.primary + '10',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  pricingContent: {
    flexDirection: 'column',
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  currentPrice: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginRight: spacing.md,
    fontFamily: 'Poppins-Bold',
  },
  originalPrice: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
    marginRight: spacing.sm,
    fontFamily: 'Poppins-Regular',
  },
  discountBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  discountText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    fontFamily: 'Poppins-Medium',
  },
  descriptionContainer: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontFamily: 'Poppins-Medium',
  },
  description: {
    fontSize: typography.fontSizes.md,
    lineHeight: 22,
    color: colors.text.secondary,
    fontFamily: 'Poppins-Regular',
  },
  readMoreText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
    marginTop: spacing.xs,
    fontFamily: 'Poppins-Medium',
  },
});

export default ProductInfoSection;