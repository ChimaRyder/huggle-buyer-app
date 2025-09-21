import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FoodItem } from '../../data/food/models';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import SafeImage from '@/components/common/SafeImage';

interface FoodItemCardProps {
  item: FoodItem;
  onPress: () => void;
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <SafeImage source={{ uri: item.image }} style={styles.image} />
        {item.isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Popular</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          {item.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color={colors.warning} />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          <View style={styles.dietaryContainer}>
            {item.isVegetarian && (
              <View style={[styles.dietaryBadge, styles.vegetarianBadge]}>
                <Text style={styles.dietaryText}>V</Text>
              </View>
            )}
            {item.isVegan && (
              <View style={[styles.dietaryBadge, styles.veganBadge]}>
                <Text style={styles.dietaryText}>VG</Text>
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
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
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
  vegetarianBadge: {
    backgroundColor: colors.success,
  },
  veganBadge: {
    backgroundColor: colors.successDark,
  },
  dietaryText: {
    color: colors.text.inverse,
    fontSize: 8,
    fontWeight: '600',
  },
});

export default FoodItemCard;