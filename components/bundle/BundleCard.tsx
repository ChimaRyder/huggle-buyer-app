import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BackendBundle } from '@/types/BackendModels';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { colors } from '@/constants/theme';
import SafeImage from '@/components/common/SafeImage';
import type { DynamicPricingInfo } from '@/types/DynamicPricing';
import { PriceCountdown } from '@/components/product/PriceCountdown';
import { config } from '@/constants/config';

interface BundleCardProps {
  bundle: BackendBundle;
  onPress: () => void;
  fullWidth?: boolean;
}

const BundleCard: React.FC<BundleCardProps> = ({ bundle, onPress, fullWidth = false }) => {
  const { getToken } = useAuth();
  const [pricingInfo, setPricingInfo] = useState<DynamicPricingInfo | null>(null);

  // Get the best available image
  const getBundleImage = () => {
    // Priority: coverImage > imageUrl > first image in images array > first product image
    if (bundle.coverImage) return bundle.coverImage;
    if (bundle.imageUrl) return bundle.imageUrl;
    if (bundle.images && bundle.images.length > 0) return bundle.images[0];
    if (bundle.products && bundle.products.length > 0) {
      const firstProduct = bundle.products[0];
      if (firstProduct?.image && firstProduct.image.length > 0) {
        return firstProduct.image[0];
      }
    }
    return '';
  };

  // Fetch dynamic pricing info if enabled
  useEffect(() => {
    const loadPricingInfo = async () => {
      if (bundle.id && bundle.isDynamicPricingEnabled) {
        try {
          const token = await getToken({ template: 'seller_app' });
          const response = await fetch(
            `${config.apiBaseUrl}/api/products/bundles/${bundle.id}/pricing-info`,
            {
              headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              setPricingInfo(data.data);
            }
          }
        } catch (error) {
          console.error('Error fetching bundle pricing info:', error);
        }
      }
    };

    loadPricingInfo();
  }, [bundle.id, bundle.isDynamicPricingEnabled]);

  const hasDiscount = bundle.hasDiscount || (bundle.price < bundle.originalPrice);
  const productCount = bundle.products?.length || 0;

  return (
    <TouchableOpacity style={[styles.container, fullWidth && styles.fullWidthContainer]} onPress={onPress}>
      <View style={styles.imageContainer}>
        <SafeImage
          source={{ uri: getBundleImage() }}
          style={styles.image}
        />

        {/* Bundle Badge */}
        <View style={styles.bundleBadge}>
          <Ionicons name="layers" size={10} color={colors.text.inverse} />
          <Text style={styles.bundleBadgeText}>{productCount} items</Text>
        </View>

        {/* Discount Badge */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {bundle.discountPercentage ? `${Math.round(bundle.discountPercentage)}% OFF` : `${Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100)}% OFF`}
            </Text>
          </View>
        )}

        {/* Dynamic Pricing Countdown Badge */}
        {pricingInfo && pricingInfo?.priceTrajectory?.[1] && (() => {
          const targetTime = new Date(pricingInfo.priceTrajectory[1].timestamp).getTime();
          const now = new Date().getTime();
          const daysDifference = (targetTime - now) / (1000 * 60 * 60 * 24);

          if (daysDifference <= 3) {
            return (
              <View style={styles.countdownBadge}>
                <PriceCountdown
                  targetTimestamp={pricingInfo.priceTrajectory[1].timestamp}
                  compact={true}
                  showIcon={true}
                />
              </View>
            );
          }
          return null;
        })()}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{bundle.name}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {bundle.description || `Bundle of ${productCount} products`}
        </Text>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₱{bundle.price.toFixed(2)}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>₱{bundle.originalPrice.toFixed(2)}</Text>
            )}
          </View>

          {/* Product summary tags */}
          {bundle.products && bundle.products.length > 0 && (
            <View style={styles.productTagsContainer}>
              {bundle.products.slice(0, 2).map((product, index) => (
                <View key={product.id || index} style={styles.productTag}>
                  <Text style={styles.productTagText} numberOfLines={1}>
                    {product.name}
                  </Text>
                </View>
              ))}
              {bundle.products.length > 2 && (
                <Text style={styles.moreProductsText}>+{bundle.products.length - 2}</Text>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    marginBottom: 16,
    width: 170,
    borderWidth: 1,
    borderColor: colors.primary.light,
  },
  fullWidthContainer: {
    width: '100%',
    marginBottom: 0,
  },
  imageContainer: {
    height: 130,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  bundleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.primary.main,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bundleBadgeText: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: '600',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: '600',
  },
  countdownBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  description: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 8,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'column',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.main,
  },
  originalPrice: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  productTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  productTag: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: 70,
  },
  productTagText: {
    fontSize: 9,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  moreProductsText: {
    fontSize: 9,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
});

export default BundleCard;
