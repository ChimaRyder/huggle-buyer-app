import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/constants/theme';
import type { SearchFilters as SearchFiltersType } from '@/types/Search';

interface SearchFiltersProps {
  visible: boolean;
  onClose: () => void;
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

// Available categories for filtering
const CATEGORIES = [
  { id: 'electronics', name: 'Electronics', icon: 'laptop-outline' },
  { id: 'food', name: 'Food & Drinks', icon: 'restaurant-outline' },
  { id: 'fashion', name: 'Fashion', icon: 'shirt-outline' },
  { id: 'health', name: 'Health & Beauty', icon: 'fitness-outline' },
  { id: 'home', name: 'Home & Garden', icon: 'home-outline' },
  { id: 'sports', name: 'Sports & Outdoors', icon: 'football-outline' },
  { id: 'books', name: 'Books & Media', icon: 'book-outline' },
  { id: 'toys', name: 'Toys & Games', icon: 'game-controller-outline' },
  { id: 'organic', name: 'Organic & Natural', icon: 'leaf-outline' },
];

// Sort options
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant', icon: 'star-outline' },
  { value: 'price_asc', label: 'Price: Low to High', icon: 'arrow-up-outline' },
  { value: 'price_desc', label: 'Price: High to Low', icon: 'arrow-down-outline' },
  { value: 'distance', label: 'Distance', icon: 'location-outline' },
  { value: 'newest', label: 'Newest', icon: 'time-outline' },
];

// Distance options (in kilometers)
const DISTANCE_OPTIONS = [
  { value: 1, label: '1 km' },
  { value: 3, label: '3 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50+ km' },
];

const SearchFilters: React.FC<SearchFiltersProps> = ({
  visible,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<SearchFiltersType>(filters);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = (key: keyof SearchFiltersType, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApplyFilters();
    onClose();
  };

  const handleReset = () => {
    const resetFilters: SearchFiltersType = {
      sortBy: 'relevance',
    };
    setLocalFilters(resetFilters);
    onResetFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.category) count++;
    if (localFilters.minPrice !== undefined || localFilters.maxPrice !== undefined) count++;
    if (localFilters.distance) count++;
    if (localFilters.sortBy && localFilters.sortBy !== 'relevance') count++;
    return count;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filters</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    localFilters.category === category.id && styles.categoryItemSelected,
                  ]}
                  onPress={() => 
                    updateFilter('category', 
                      localFilters.category === category.id ? undefined : category.id
                    )
                  }
                >
                  <Ionicons
                    name={category.icon as any}
                    size={20}
                    color={
                      localFilters.category === category.id
                        ? colors.primary.main
                        : colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      localFilters.category === category.id && styles.categoryTextSelected,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.priceInputs}>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceInputLabel}>Min Price</Text>
                <TextInput
                  style={styles.priceInput}
                  value={localFilters.minPrice?.toString() || ''}
                  onChangeText={(text) => updateFilter('minPrice', text ? parseFloat(text) : undefined)}
                  placeholder="₱0"
                  keyboardType="numeric"
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>
              <View style={styles.priceSeparator}>
                <Text style={styles.priceSeparatorText}>to</Text>
              </View>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceInputLabel}>Max Price</Text>
                <TextInput
                  style={styles.priceInput}
                  value={localFilters.maxPrice?.toString() || ''}
                  onChangeText={(text) => updateFilter('maxPrice', text ? parseFloat(text) : undefined)}
                  placeholder="₱1000"
                  keyboardType="numeric"
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>
            </View>
          </View>

          {/* Distance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distance</Text>
            <View style={styles.distanceOptions}>
              {DISTANCE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.distanceOption,
                    localFilters.distance === option.value && styles.distanceOptionSelected,
                  ]}
                  onPress={() => 
                    updateFilter('distance', 
                      localFilters.distance === option.value ? undefined : option.value
                    )
                  }
                >
                  <Text
                    style={[
                      styles.distanceOptionText,
                      localFilters.distance === option.value && styles.distanceOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort By */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.sortOptions}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOption,
                    localFilters.sortBy === option.value && styles.sortOptionSelected,
                  ]}
                  onPress={() => updateFilter('sortBy', option.value)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={
                      localFilters.sortBy === option.value
                        ? colors.primary.main
                        : colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.sortOptionText,
                      localFilters.sortBy === option.value && styles.sortOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.activeFiltersInfo}>
            <Text style={styles.activeFiltersText}>
              {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} active
            </Text>
          </View>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  resetButton: {
    padding: spacing.xs,
  },
  resetButtonText: {
    fontSize: typography.fontSizes.md,
    color: colors.primary.main,
    fontWeight: typography.fontWeights.medium,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing.sm,
  },
  categoryItemSelected: {
    backgroundColor: colors.primary.light + '20',
    borderColor: colors.primary.main,
  },
  categoryText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  categoryTextSelected: {
    color: colors.primary.main,
    fontWeight: typography.fontWeights.medium,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceInputLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
  },
  priceSeparator: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  priceSeparatorText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.tertiary,
  },
  distanceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  distanceOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
  },
  distanceOptionSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  distanceOptionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  distanceOptionTextSelected: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeights.medium,
  },
  sortOptions: {
    gap: spacing.xs,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
  },
  sortOptionSelected: {
    backgroundColor: colors.primary.light + '20',
    borderColor: colors.primary.main,
  },
  sortOptionText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  sortOptionTextSelected: {
    color: colors.primary.main,
    fontWeight: typography.fontWeights.medium,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
  },
  activeFiltersInfo: {
    flex: 1,
  },
  activeFiltersText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  applyButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  applyButtonText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.inverse,
  },
});

export default SearchFilters;