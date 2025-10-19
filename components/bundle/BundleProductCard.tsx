import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import SafeImage from '@/components/common/SafeImage';
import type { BackendBundleProduct } from '@/types/BackendModels';

interface BundleProductCardProps {
  product: BackendBundleProduct;
  onPress?: () => void;
  compact?: boolean; // For simplified seller-app style
}

const BundleProductCard: React.FC<BundleProductCardProps> = ({ 
  product, 
  onPress,
  compact = false 
}) => {
  const hasDiscount = product.price < product.originalPrice;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  if (compact) {
    // Simplified seller-app style
    return (
      <TouchableOpacity 
        style={styles.compactContainer} 
        onPress={handlePress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={styles.compactImageContainer}>
          <SafeImage 
            source={{ 
              uri: product.image && product.image.length > 0 ? product.image[0] : '' 
            }} 
            style={styles.compactImage} 
          />
          {!product.isActive && (
            <View style={styles.compactInactiveOverlay}>
              <Text style={styles.compactInactiveText}>N/A</Text>
            </View>
          )}
        </View>
        
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={2}>{product.name}</Text>
          {product.tags && product.tags.length > 0 && (
            <Text style={styles.compactTags} numberOfLines={1}>
              {product.tags.slice(0, 2).join(', ')}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Full detailed view
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.imageContainer}>
        <SafeImage 
          source={{ 
            uri: product.image && product.image.length > 0 ? product.image[0] : '' 
          }} 
          style={styles.image} 
        />
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
          </View>
        )}
        {!product.isActive && (
          <View style={styles.inactiveOverlay}>
            <Text style={styles.inactiveText}>Unavailable</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          <View style={styles.stockContainer}>
            <Ionicons 
              name="cube-outline" 
              size={12} 
              color={product.stock > 0 ? colors.success : colors.error} 
            />
            <Text style={[
              styles.stockText,
              { color: product.stock > 0 ? colors.success : colors.error }
            ]}>
              {product.stock}
            </Text>
          </View>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          {hasDiscount && (
            <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
          )}
        </View>
        
        {/* Product Tags */}
        {product.tags && product.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {product.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {product.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{product.tags.length - 3}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Compact styles (seller-app style)
  compactContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border.primary,
    padding: 8,
    alignItems: 'center',
  },
  compactImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
  },
  compactImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.secondary,
  },
  compactInactiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactInactiveText: {
    color: colors.text.inverse,
    fontSize: 8,
    fontWeight: '600',
  },
  compactContent: {
    flex: 1,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  compactTags: {
    fontSize: 11,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  
  // Full detailed styles
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 100,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.secondary,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.error,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  inactiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveText: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.main,
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 6,
  },
  tag: {
    backgroundColor: colors.primary.main + '15',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 2,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.primary.main,
  },
  moreTagsText: {
    fontSize: 10,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryText: {
    fontSize: 10,
    color: colors.warning,
    marginLeft: 2,
  },
});

export default BundleProductCard;