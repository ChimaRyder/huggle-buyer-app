import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import SafeImage from '@/components/common/SafeImage';

// Restaurant interface for the card component
interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image: string | string[]; // Support both string and array formats
  rating: number;
  deliveryTime: string;
  distance: string;
  categories?: string[];
  isFavorite: boolean;
  promotion?: string;
  address?: string;
  city?: string;
  province?: string;
  isOpen?: boolean;
  isVerified?: boolean;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  onToggleFavorite: (id: string) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ 
  restaurant, 
  onPress, 
  onToggleFavorite 
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <SafeImage source={{ uri: restaurant.image }} style={styles.image} />
        {restaurant.promotion && (
          <View style={styles.promotionBadge}>
            <Text style={styles.promotionText}>{restaurant.promotion}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
          <TouchableOpacity 
            onPress={() => onToggleFavorite(restaurant.id)}
            style={styles.favoriteButton}
          >
            <Ionicons 
              name={restaurant.isFavorite ? "heart" : "heart-outline"} 
              size={20} 
              color={restaurant.isFavorite ? colors.danger : colors.icon.secondary} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.ratingText}>{restaurant.rating}</Text>
          </View>
          
          <Text style={styles.deliveryInfo}>
            {restaurant.deliveryTime} • {restaurant.distance}
          </Text>
        </View>
        
        <View style={styles.categoriesContainer}>
          {restaurant.categories && restaurant.categories.length > 0 ? (
            restaurant.categories.map((category, index) => (
              <View key={index} style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            ))
          ) : (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>Store</Text>
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
  },
  imageContainer: {
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  promotionBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  promotionText: {
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
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  favoriteButton: {
    padding: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  deliveryInfo: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
});

export default RestaurantCard;