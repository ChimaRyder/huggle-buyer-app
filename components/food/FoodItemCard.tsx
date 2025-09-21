import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BackendProduct } from '@/types/BackendModels';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import SafeImage from '@/components/common/SafeImage';

interface FoodItemCardProps {
  item: BackendProduct;
  onPress: () => void;
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({ item, onPress }) => {
  // Calculate display price and discount info from DTO
  const hasDiscount = item.hasDiscount || (item.price < item.originalPrice);
  const displayPrice = item.price; // Current price from DTO
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <SafeImage 
          source={{ uri: item.image && item.image.length > 0 ? item.image[0] : '' }} 
          style={styles.image} 
        />
        {hasDiscount && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>
              {item.discountPercentage ? `${Math.round(item.discountPercentage)}% OFF` : `${Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF`}
            </Text>
          </View>
        )}
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
            <Text style={styles.price}>${displayPrice.toFixed(2)}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
            )}
          </View>
          <View style={styles.dietaryContainer}>
            {item.tags && item.tags.length > 0 && (
              <View style={[styles.dietaryBadge, styles.categoryBadge]}>
                <Text style={styles.dietaryText}>{item.tags[0]?.substring(0, 2).toUpperCase()}</Text>
              </View>
            )}
          </View>
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
  },
  imageContainer: {
    height: 120,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: colors.primary,
  },
  dietaryText: {
    color: colors.text.inverse,
    fontSize: 8,
    fontWeight: '600',
  },
});

export default FoodItemCard;