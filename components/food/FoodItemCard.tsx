import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BackendProduct } from '@/types/BackendModels';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { colors } from '@/constants/theme';
import SafeImage from '@/components/common/SafeImage';
import type { DynamicPricingInfo } from '@/types/DynamicPricing';
import { fetchDynamicPricingInfo } from '@/services/pricingService';
import { PriceCountdown } from '@/components/product/PriceCountdown';

interface FoodItemCardProps {
  item: BackendProduct;
  onPress: () => void;
  fullWidth?: boolean;
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({ item, onPress, fullWidth = false }) => {
  const { getToken } = useAuth();
  const [pricingInfo, setPricingInfo] = useState<DynamicPricingInfo | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);

  // Fetch dynamic pricing info only if enabled
  useEffect(() => {
    const loadPricingInfo = async () => {
      // Only fetch if dynamic pricing is enabled for this product
      if (item.id && item.isDynamicPricingEnabled) {
        try {
          setLoadingPricing(true);
          const token = await getToken({ template: 'seller_app' });
          const response = await fetchDynamicPricingInfo(item.id, token);
          if (response.success && response.data) {
            setPricingInfo(response.data);
          }
        } catch (error) {
          // Silently handle errors - pricing info is optional enhancement
          console.warn('FoodItemCard: Could not load pricing info for', item.id);
        } finally {
          setLoadingPricing(false);
        }
      }
    };

    loadPricingInfo();
  }, [item.id, item.isDynamicPricingEnabled]);


  // Calculate display price and discount info from DTO
  const hasDiscount = item.hasDiscount || (item.price < item.originalPrice);
  const displayPrice = item.price; // Current price from DTO

  // Get the best available image - handle both products and bundles
  const getItemImage = () => {
    if (item.coverImage) return item.coverImage;
    if (item.image && item.image.length > 0) return item.image[0];
    // Bundle-specific fallbacks (cast to any for bundle fields)
    const bundleItem = item as any;
    if (bundleItem.imageUrl) return bundleItem.imageUrl;
    if (bundleItem.images && bundleItem.images.length > 0) return bundleItem.images[0];
    return '';
  };

  return (
    <TouchableOpacity style={[styles.container, fullWidth && styles.fullWidthContainer]} onPress={onPress}>
      <View style={styles.imageContainer}>
        <SafeImage
          source={{ uri: getItemImage() }}
          style={styles.image}
        />

        {/* Bundle Badge - to distinguish bundles from products */}
        {item.isBundle && (
          <View style={styles.bundleBadge}>
            <Ionicons name="layers" size={10} color={colors.text.inverse} />
            <Text style={styles.bundleBadgeText}>Bundle</Text>
          </View>
        )}

        {hasDiscount && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>
              {item.discountPercentage ? `${Math.round(item.discountPercentage)}% OFF` : `${Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF`}
            </Text>
          </View>
        )}

        {/* Dynamic Pricing Countdown Badge */}
        {pricingInfo && pricingInfo?.priceTrajectory[1] && (() => {
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
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          {item.rating && item.rating > 0 && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color={colors.warning} />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₱{displayPrice.toFixed(2)}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>₱{item.originalPrice.toFixed(2)}</Text>
            )}
          </View>
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={[styles.tagBadge]}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {item.tags.length > 3 && (
                <View style={[styles.tagBadge, { backgroundColor: colors.background.secondary }]}>
                  <Text style={[styles.tagText, { color: colors.text.primary }]}>
                    +{item.tags.length - 3}
                  </Text>
                </View>
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
  popularBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popularText: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: '600',
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
    marginRight: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 2,
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: '500',
  },
  description: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 8,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  originalPrice: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  dietaryContainer: {
    flexDirection: 'row',
  },
  dietaryBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  categoryBadge: {
    backgroundColor: colors.primary.main,
  },
  dietaryText: {
    color: colors.text.inverse,
    fontSize: 8,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 4,
  },
  tagBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 2,
    backgroundColor: colors.primary.main,
  },
  tagText: {
    fontSize: 8,
    color: colors.text.inverse,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});

export default FoodItemCard;
