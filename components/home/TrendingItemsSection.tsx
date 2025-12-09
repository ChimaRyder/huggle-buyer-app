import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { useProductContext } from '@/context/ProductContext';
import FoodItemCard from '@/components/food/FoodItemCard';

interface TrendingItemsSectionProps {
  onFoodItemPress: (itemId: string) => void;
  onSeeAllPress: () => void;
}

const TrendingItemsSection: React.FC<TrendingItemsSectionProps> = ({ onFoodItemPress, onSeeAllPress }) => {
  const { trendingProducts, isFetchingTrending, trendingError, fetchTrendingProducts } = useProductContext();
  
  // Track if we've done initial fetch
  const hasFetchedRef = useRef(false);

  // Fetch all trending products on mount (no location filter)
  useEffect(() => {
    const fetchProducts = async () => {
      if (!hasFetchedRef.current) {
        hasFetchedRef.current = true;
        console.log('🔍 TrendingItemsSection: Fetching all trending products');
        await fetchTrendingProducts();
      }
    };

    fetchProducts();
  }, [fetchTrendingProducts]);

  // Show up to 10 items for horizontal scroll
  const displayItems = trendingProducts.slice(0, 10);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Trending Items</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>All areas</Text>
          </View>
        </View>
        {displayItems.length > 0 && (
          <TouchableOpacity onPress={onSeeAllPress} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See All</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary.main} />
          </TouchableOpacity>
        )}
      </View>
      
      {isFetchingTrending && trendingProducts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading trending items...</Text>
        </View>
      ) : trendingError && trendingProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.text.tertiary} />
          <Text style={styles.emptyText}>Couldn't load trending items</Text>
          <Text style={styles.emptySubtext}>Pull down to refresh</Text>
        </View>
      ) : displayItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="flame-outline" size={32} color={colors.text.tertiary} />
          <Text style={styles.emptyText}>No trending items yet</Text>
          <Text style={styles.emptySubtext}>Check back later for new products</Text>
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {displayItems.map((item) => (
            <View key={item.id} style={styles.cardWrapper}>
              <FoodItemCard
                item={item}
                onPress={() => onFoodItemPress(item.id)}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 24,
  },
  badgeContainer: {
    backgroundColor: colors.info + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  badgeText: {
    fontSize: 12,
    color: colors.info,
    fontWeight: '600',
    lineHeight: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary.main,
    marginRight: 4,
  },
  scrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 4,
  },
  cardWrapper: {
    marginRight: 12,
  },
  // Empty/Loading states
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    marginHorizontal: 16,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: colors.text.secondary,
  },
});

export default TrendingItemsSection;
