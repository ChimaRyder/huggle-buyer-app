/**
 * CategoryCarousel Component
 * Horizontal scrolling list of product categories
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';

import { images, type ImageSource } from '@/assets';
import { colors, spacing, typography, radii } from '@/constants/theme';

interface Category {
  id: string;
  name: string;
  image: ImageSource;
}

const categories: Category[] = [
  { id: 'Food', name: 'Food', image: images.categories.food },
  {
    id: 'Electronics',
    name: 'Electronics',
    image: images.categories.electronics,
  },
  { id: 'Clothing', name: 'Clothing', image: images.categories.clothing },
  {
    id: 'HomeAppliances',
    name: 'Home Appliances',
    image: images.categories.homeAppliances,
  },
  { id: 'Books', name: 'Books', image: images.categories.books },
  {
    id: 'HealthAndBeauty',
    name: 'Health & Beauty',
    image: images.categories.healthAndBeauty,
  },
  {
    id: 'SportsAndOutdoors',
    name: 'Sports & Outdoors',
    image: images.categories.sports,
  },
  { id: 'ToysAndGames', name: 'Toys & Games', image: images.categories.toys },
  { id: 'Pets', name: 'Pets', image: images.categories.pets },
  { id: 'BabyProducts', name: 'Baby Products', image: images.categories.baby },
  {
    id: 'OfficeSupplies',
    name: 'Office Supplies',
    image: images.categories.office,
  },
  { id: 'ArtsAndCrafts', name: 'Arts & Crafts', image: images.categories.arts },
];

export const CategoryCarousel: React.FC = () => {
  const router = useRouter();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={styles.categoryButton}
          onPress={() => {
            router.push({
              pathname: '/(screens)/TrendingProductsScreen',
              params: { productType: category.id },
            });
          }}
        >
          <View style={styles.imageContainer}>
            <Image source={category.image} style={styles.image} />
          </View>
          <Text style={styles.categoryName}>{category.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  categoryButton: {
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.border.primary,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryName: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default CategoryCarousel;
