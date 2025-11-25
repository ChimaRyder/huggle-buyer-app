import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/constants/theme';
import { useProductContext } from '@/context/ProductContext';
import { getCategoryIcon, getCategoryColor } from '@/components/icons/CategoryIcons';

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
      // Add product type as a category
      if (product.productType) {
        const type = product.productType.toLowerCase().trim();
        categoryMap.set(type, (categoryMap.get(type) || 0) + 1);
      }
    });
    
    // Convert to category objects and sort by count
    const categories: DynamicCategory[] = Array.from(categoryMap.entries())
      .filter(([name, count]) => count > 0) // Only include categories with at least 1 product
      .sort(([, countA], [, countB]) => countB - countA) // Sort by count descending
      .slice(0, 8) // Limit to top 8 categories
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
  
  if (isFetchingTrending) {
    return (
      <View style={styles.section}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </View>
    );
  }
  
  if (dynamicCategories.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No categories available</Text>
          <Text style={styles.emptySubtext}>Categories will appear once products are loaded</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {dynamicCategories.map((category) => {
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
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
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
  },
  iconContainer: {
    marginBottom: 6,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.inverse,
    textAlign: 'center',
    lineHeight: 14,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 8,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.quaternary,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default CategorySection;