import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '@/constants/theme';
import { useProductContext } from '@/context/ProductContext';
import { getCategoryIcon, getCategoryColor } from '@/components/icons/CategoryIcons';
import { Ionicons } from '@expo/vector-icons';

interface CategorySectionProps {
  onCategoryPress: (categoryId: string) => void;
}

interface DynamicCategory {
  id: string;
  name: string;
  count: number;
  color: string;
  IconComponent: React.ComponentType<{ size?: number; color?: string }>;
}

// Default categories that always show when no products are available
const DEFAULT_CATEGORIES = [
  { id: 'fruits', name: 'Fruits', iconName: 'nutrition-outline' as const },
  { id: 'vegetables', name: 'Vegetables', iconName: 'leaf-outline' as const },
  { id: 'meat', name: 'Meat', iconName: 'restaurant-outline' as const },
  { id: 'seafood', name: 'Seafood', iconName: 'fish-outline' as const },
  { id: 'dairy', name: 'Dairy', iconName: 'egg-outline' as const },
  { id: 'bakery', name: 'Bakery', iconName: 'cafe-outline' as const },
  { id: 'beverages', name: 'Beverages', iconName: 'wine-outline' as const },
  { id: 'snacks', name: 'Snacks', iconName: 'fast-food-outline' as const },
];

const CategorySection: React.FC<CategorySectionProps> = ({ onCategoryPress }) => {
  const { trendingProducts, isFetchingTrending } = useProductContext();
  
  // Generate dynamic categories from trending products
  const dynamicCategories = useMemo((): DynamicCategory[] => {
    if (!trendingProducts || trendingProducts.length === 0) {
      return [];
    }
    
    // Extract productTypes from trending products
    const categoryMap = new Map<string, number>();
    
    trendingProducts.forEach(product => {
      if (product.productType) {
        const type = product.productType.toLowerCase().trim();
        categoryMap.set(type, (categoryMap.get(type) || 0) + 1);
      }
    });
    
    // Convert to category objects and sort by count
    const categories: DynamicCategory[] = Array.from(categoryMap.entries())
      .filter(([, count]) => count > 0)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 8)
      .map(([name, count]) => {
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        return {
          id: name,
          name: capitalizedName,
          count,
          color: getCategoryColor(name),
          IconComponent: getCategoryIcon(name),
        };
      });
    
    return categories;
  }, [trendingProducts]);

  // Use dynamic categories if available, otherwise show default categories
  const showDynamicCategories = dynamicCategories.length > 0;

  // Render a default category card with Ionicons
  const renderDefaultCategory = (category: typeof DEFAULT_CATEGORIES[0]) => {
    const categoryColor = getCategoryColor(category.id);
    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryCard, { backgroundColor: categoryColor }]}
        onPress={() => onCategoryPress(category.id)}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={category.iconName} size={28} color={colors.text.inverse} />
        </View>
        <Text style={styles.categoryName}>{category.name}</Text>
      </TouchableOpacity>
    );
  };

  // Render a dynamic category card
  const renderDynamicCategory = (category: DynamicCategory) => {
    const IconComponent = category.IconComponent;
    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryCard, { backgroundColor: category.color }]}
        onPress={() => onCategoryPress(category.id)}
      >
        <View style={styles.iconContainer}>
          <IconComponent size={28} color={colors.text.inverse} />
        </View>
        <Text style={styles.categoryName}>{category.name}</Text>
        {category.count > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{category.count}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Categories</Text>
        {isFetchingTrending && !showDynamicCategories && (
          <Text style={styles.loadingText}>Updating...</Text>
        )}
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {showDynamicCategories 
          ? dynamicCategories.map(renderDynamicCategory)
          : DEFAULT_CATEGORIES.map(renderDefaultCategory)
        }
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  loadingText: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoriesContent: {
    paddingRight: 16,
    paddingBottom: 10,
  },
  categoryCard: {
    width: 80,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    position: 'relative',
  },
  iconContainer: {
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.inverse,
    textAlign: 'center',
    lineHeight: 14,
  },
  countBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.primary,
  },
});

export default CategorySection;
