import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '@/constants/theme';
import { ReviewsFilter } from '@/utils/reviews';

interface FilterBarProps {
  activeFilters: ReviewsFilter;
  onFiltersChange: (filters: ReviewsFilter) => void;
  totalReviews: number;
  reviewsWithMedia: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  isLoading?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  activeFilters,
  onFiltersChange,
  totalReviews,
  reviewsWithMedia,
  ratingDistribution,
  isLoading = false,
}) => {
  const handleRatingFilter = (rating: number) => {
    if (activeFilters.rating === rating) {
      // Remove rating filter if already selected
      onFiltersChange({ ...activeFilters, rating: undefined });
    } else {
      // Set new rating filter
      onFiltersChange({ ...activeFilters, rating });
    }
  };

  const handleMediaFilter = () => {
    if (activeFilters.hasMedia) {
      // Remove media filter if already selected
      onFiltersChange({ ...activeFilters, hasMedia: undefined });
    } else {
      // Set media filter
      onFiltersChange({ ...activeFilters, hasMedia: true });
    }
  };

  const handleSortChange = (sortBy: ReviewsFilter['sortBy']) => {
    if (activeFilters.sortBy === sortBy) {
      // Remove sort if already selected (default to newest)
      onFiltersChange({ ...activeFilters, sortBy: 'newest' });
    } else {
      // Set new sort
      onFiltersChange({ ...activeFilters, sortBy });
    }
  };

  const handleClearFilters = () => {
    onFiltersChange({ sortBy: 'newest' });
  };

  const hasActiveFilters = Boolean(
    activeFilters.rating || 
    activeFilters.hasMedia || 
    (activeFilters.sortBy && activeFilters.sortBy !== 'newest')
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Clear All Button */}
        {hasActiveFilters && (
          <TouchableOpacity
            style={[styles.filterChip, styles.clearAllChip]}
            onPress={handleClearFilters}
            disabled={isLoading}
          >
            <Ionicons name="close-circle" size={16} color={colors.text.inverse} />
            <Text style={[styles.chipText, styles.clearAllText]}>Clear All</Text>
          </TouchableOpacity>
        )}

        {/* All Reviews */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            !hasActiveFilters && styles.activeChip,
          ]}
          onPress={handleClearFilters}
          disabled={isLoading}
        >
          <Text style={[
            styles.chipText,
            !hasActiveFilters && styles.activeChipText,
          ]}>
            All ({totalReviews})
          </Text>
        </TouchableOpacity>

        {/* Star Rating Filters */}
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingDistribution[rating as keyof typeof ratingDistribution] || 0;
          const isActive = activeFilters.rating === rating;
          
          if (count === 0) return null;

          return (
            <TouchableOpacity
              key={rating}
              style={[
                styles.filterChip,
                isActive && styles.activeChip,
              ]}
              onPress={() => handleRatingFilter(rating)}
              disabled={isLoading}
            >
              <View style={styles.ratingChipContent}>
                <Text style={[
                  styles.chipText,
                  isActive && styles.activeChipText,
                ]}>
                  {rating}
                </Text>
                <Ionicons 
                  name="star" 
                  size={12} 
                  color={isActive ? colors.text.inverse : colors.warning} 
                />
                <Text style={[
                  styles.chipText,
                  isActive && styles.activeChipText,
                ]}>
                  ({count})
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* With Photos Filter */}
        {reviewsWithMedia > 0 && (
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilters.hasMedia && styles.activeChip,
            ]}
            onPress={handleMediaFilter}
            disabled={isLoading}
          >
            <View style={styles.mediaChipContent}>
              <Ionicons 
                name="camera" 
                size={14} 
                color={activeFilters.hasMedia ? colors.text.inverse : colors.primary.main} 
              />
              <Text style={[
                styles.chipText,
                activeFilters.hasMedia && styles.activeChipText,
              ]}>
                With Photos ({reviewsWithMedia})
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Sort Options */}
        <View style={styles.sortSection}>
          <Text style={styles.sortLabel}>Sort:</Text>
          
          {(['newest', 'oldest', 'highest_rating', 'lowest_rating'] as const).map((sortOption) => {
            const isActive = activeFilters.sortBy === sortOption;
            const isDefault = sortOption === 'newest';
            const sortLabels = {
              newest: 'Newest',
              oldest: 'Oldest',
              highest_rating: 'Highest',
              lowest_rating: 'Lowest',
            };

            return (
              <TouchableOpacity
                key={sortOption}
                style={[
                  styles.sortChip,
                  (isActive || (isDefault && !activeFilters.sortBy)) && styles.activeSortChip,
                ]}
                onPress={() => handleSortChange(sortOption)}
                disabled={isLoading}
              >
                <Text style={[
                  styles.sortChipText,
                  (isActive || (isDefault && !activeFilters.sortBy)) && styles.activeSortChipText,
                ]}>
                  {sortLabels[sortOption]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    paddingVertical: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  filterChip: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeChip: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  clearAllChip: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  chipText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
  },
  activeChipText: {
    color: colors.text.inverse,
  },
  clearAllText: {
    color: colors.text.inverse,
  },
  ratingChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  mediaChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sortSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: spacing.md,
    paddingLeft: spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: colors.border.primary,
  },
  sortLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  sortChip: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  activeSortChip: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  sortChipText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.secondary,
  },
  activeSortChipText: {
    color: colors.text.inverse,
  },
});

export default FilterBar;