import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/constants/theme';
import type { SearchFilters as SearchFiltersType } from '@/types/Search';

interface SearchFilterIndicatorProps {
  filters: SearchFiltersType;
  onFilterPress: () => void;
  onRemoveFilter: (key: keyof SearchFiltersType) => void;
}

const SearchFilterIndicator: React.FC<SearchFilterIndicatorProps> = ({
  filters,
  onFilterPress,
  onRemoveFilter,
}) => {
  const getFilterItems = () => {
    const items: Array<{ key: keyof SearchFiltersType; label: string; value: string }> = [];

    if (filters.category) {
      items.push({
        key: 'category',
        label: 'Category',
        value: filters.category.charAt(0).toUpperCase() + filters.category.slice(1)
      });
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      let priceLabel = 'Price';
      let priceValue = '';
      
      if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        priceValue = `₱${filters.minPrice} - ₱${filters.maxPrice}`;
      } else if (filters.minPrice !== undefined) {
        priceValue = `Min ₱${filters.minPrice}`;
      } else if (filters.maxPrice !== undefined) {
        priceValue = `Max ₱${filters.maxPrice}`;
      }

      items.push({
        key: 'minPrice', // Use minPrice as key to represent price filter
        label: priceLabel,
        value: priceValue
      });
    }

    if (filters.distance) {
      items.push({
        key: 'distance',
        label: 'Distance',
        value: `${filters.distance} km`
      });
    }

    if (filters.sortBy && filters.sortBy !== 'relevance') {
      const sortLabels: Record<string, string> = {
        price_asc: 'Price ↑',
        price_desc: 'Price ↓',
        distance: 'Distance',
        newest: 'Newest',
      };

      items.push({
        key: 'sortBy',
        label: 'Sort',
        value: sortLabels[filters.sortBy] || filters.sortBy
      });
    }

    return items;
  };

  const filterItems = getFilterItems();

  if (filterItems.length === 0) {
    return null;
  }

  const handleRemovePrice = () => {
    // Remove both min and max price
    onRemoveFilter('minPrice');
    onRemoveFilter('maxPrice');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        {filterItems.map((item, index) => (
          <View key={`${item.key}-${index}`} style={styles.filterChip}>
            <Text style={styles.filterLabel}>{item.label}</Text>
            <Text style={styles.filterValue}>{item.value}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => {
                if (item.key === 'minPrice') {
                  handleRemovePrice();
                } else {
                  onRemoveFilter(item.key);
                }
              }}
            >
              <Ionicons name="close" size={14} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        ))}
        
        <TouchableOpacity style={styles.editFiltersButton} onPress={onFilterPress}>
          <Ionicons name="options-outline" size={16} color={colors.primary.main} />
          <Text style={styles.editFiltersText}>Edit Filters</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  filtersScroll: {
    paddingHorizontal: spacing.lg,
  },
  filtersContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.primary,
    marginRight: spacing.sm,
  },
  filterLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  filterValue: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.primary,
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  removeButton: {
    marginLeft: spacing.xs,
    padding: 2,
  },
  editFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.light + '10',
  },
  editFiltersText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary.main,
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeights.medium,
  },
});

export default SearchFilterIndicator;