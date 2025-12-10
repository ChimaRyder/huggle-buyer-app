/**
 * ProductCard Component
 * A reusable card component for displaying product information
 */

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';

import { colors, spacing, typography, radii, shadows } from '@/constants/theme';
import type { BackendProduct } from '@/types/BackendModels';
import type { DynamicPricingInfo } from '@/types/DynamicPricing';
import { fetchDynamicPricingInfo } from '@/services/pricingService';
import { PriceCountdown } from './PriceCountdown';

interface ProductCardProps {
  product: BackendProduct;
  onPress?: (product: BackendProduct) => void;
  onFavoritePress?: (product: BackendProduct) => void;
  isFavorite?: boolean;
  testID?: string;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 3) / 2; // Two cards per row with margins

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onFavoritePress,
  isFavorite = false,
  testID,
}) => {
  const { getToken } = useAuth();
  const [pricingInfo, setPricingInfo] = useState<DynamicPricingInfo | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);

  const handlePress = () => {
    onPress?.(product);
  };

  const handleFavoritePress = () => {
    onFavoritePress?.(product);
  };

  // Fetch dynamic pricing info if enabled
  useEffect(() => {
    const loadPricingInfo = async () => {
      console.log('🔍 ProductCard: Checking dynamic pricing', {
        productId: product.id,
        productName: product.name
      });

      if (product.id) {
        try {
          setLoadingPricing(true);
          console.log('📡 ProductCard: Fetching pricing info for', product.id);
          const token = await getToken({ template: 'seller_app' });
          const response = await fetchDynamicPricingInfo(product.id, token);
          console.log('✅ ProductCard: Pricing response:', {
            success: response.success,
            hasData: !!response.data,
            trajectoryLength: response.data?.priceTrajectory?.length
          });
          if (response.success && response.data) {
            setPricingInfo(response.data);
          }
        } catch (error) {
          console.error('❌ ProductCard: Error fetching pricing info:', error);
        } finally {
          setLoadingPricing(false);
        }
      }
    };

    loadPricingInfo();
  }, [product.id]);

  // Handle pricing for both products and bundles
  const discountedPrice = product.discountedPrice ?? product.price ?? 0;
  const originalPrice = product.originalPrice ?? discountedPrice;
  const hasDiscount = discountedPrice < originalPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      testID={testID}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: product.coverImage || (product.image && product.image.length > 0 ? product.image[0] : '')
          }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? colors.error : colors.text.secondary}
          />
        </TouchableOpacity>

        {/* Discount Badge */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercentage}%</Text>
          </View>
        )}

        {/* Dynamic Pricing Countdown Badge */}
        {pricingInfo && pricingInfo.priceTrajectory && pricingInfo.priceTrajectory.length > 1 && pricingInfo.priceTrajectory[1]?.timestamp && (
          <View style={styles.countdownBadge}>
            <PriceCountdown
              targetTimestamp={pricingInfo.priceTrajectory[1].timestamp}
              compact={true}
              showIcon={true}
            />
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.discountedPrice}>
            ₱{discountedPrice.toFixed(2)}
          </Text>
          {hasDiscount && (
            <Text style={styles.originalPrice}>
              ₱{originalPrice.toFixed(2)}
            </Text>
          )}
        </View>

        <View style={styles.metaContainer}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={colors.warning} />
            <Text style={styles.ratingText}>
              {(product.rating ?? 0).toFixed(1)} ({product.ratingCount ?? 0})
            </Text>
          </View>

          <Text style={styles.stockText}>
            {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: colors.background.secondary,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: CARD_WIDTH * 0.8,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.error,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  discountText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.inverse,
  },
  countdownBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
  },
  contentContainer: {
    padding: spacing.sm,
  },
  productName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    lineHeight: typography.fontSizes.md * typography.lineHeights.tight,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  discountedPrice: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary.main,
    marginRight: spacing.xs,
  },
  originalPrice: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
    marginLeft: 2,
  },
  stockText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
  },
});

export default ProductCard;
