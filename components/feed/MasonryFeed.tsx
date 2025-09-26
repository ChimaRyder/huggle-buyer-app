import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from 'react-native';
import MasonryList from '@react-native-seoul/masonry-list';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, radii, shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface MasonryFeedProps {
  data: any[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  showStoreAttribution?: boolean;
  showProductPricing?: boolean;
  showQuickActions?: boolean;
  showTimeIndicators?: boolean;
  emptyTitle?: string;
  emptySubtext?: string;
  emptyAction?: {
    text: string;
    onPress: () => void;
  };
  numColumns?: number;
  favoriteStores?: any[];
}

const MasonryFeed: React.FC<MasonryFeedProps> = ({
  data,
  loading = false,
  refreshing = false,
  onRefresh,
  showStoreAttribution = false,
  showProductPricing = false,
  showQuickActions = false,
  showTimeIndicators = false,
  emptyTitle = "No content available",
  emptySubtext = "Check back later for new updates!",
  emptyAction,
  numColumns = 2,
  favoriteStores = [],
}) => {
  const router = useRouter();

  // Enhanced card rendering with attribution and varied heights
  const renderFeedCard = ({ item, i }: any) => {
    const isProduct = item.discountedPrice !== undefined || item.price !== undefined;
    const imageUrl = isProduct
      ? item.coverImage || "https://via.placeholder.com/200x300?text=No+Image"
      : (item.imageUrls && item.imageUrls.length > 0
        ? item.imageUrls[0]
        : "https://via.placeholder.com/200x300?text=No+Image");
    
    // Create varied heights for Pinterest-style layout
    const getCardHeight = (index: number) => {
      const heights = [240, 180, 220, 260, 200, 190, 210, 230];
      return heights[index % heights.length];
    };

    return (
      <TouchableOpacity
        style={[styles.feedCard, { height: getCardHeight(i) }]}
        onPress={() =>
          router.push(
            isProduct
              ? { pathname: "/(screens)/store/ProductScreen", params: { id: item.id } }
              : { pathname: "/(screens)/store/PostScreen", params: { id: item.id } }
          )
        }
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons 
            name="grid-outline" 
            size={64} 
            color={colors.text.secondary} 
          />
        </View>
        <Text style={styles.emptyTitle}>
          {emptyTitle}
        </Text>
        <Text style={styles.emptySubtext}>
          {emptySubtext}
        </Text>
        {emptyAction && (
          <TouchableOpacity 
            style={styles.emptyAction}
            onPress={emptyAction.onPress}
          >
            <Text style={styles.emptyActionText}>{emptyAction.text}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  }

  return (
    <MasonryList
      data={data}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      showsVerticalScrollIndicator={false}
      renderItem={renderFeedCard}
      contentContainerStyle={styles.masonryContainer}
      refreshControl={onRefresh ? (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary.main]}
          tintColor={colors.primary.main}
        />
      ) : undefined}
    />
  );
};

const styles = StyleSheet.create({
  masonryContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  feedCard: {
    width: (width - spacing.md * 3) / 2,
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.white,
    position: 'relative',
    ...shadows.md,
  },
  cardImage: {
    width: '100%',
    flex: 1,
  },
  cardOverlay: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  storeAttribution: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    flex: 1,
    marginRight: spacing.sm,
  },
  storeAvatarSmall: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.xs,
  },
  storeAttributionText: {
    fontSize: typography.fontSizes.xs,
    color: colors.white,
    fontFamily: 'Poppins-Medium',
    flex: 1,
  },
  contentTypeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productIndicator: {
    backgroundColor: colors.primary,
  },
  postIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  productOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    fontFamily: 'Poppins-Bold',
    marginRight: spacing.xs,
  },
  originalPrice: {
    fontSize: typography.fontSizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'line-through',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radii.sm,
    fontFamily: 'Poppins-Regular',
  },
  quickActions: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  timeIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  timeText: {
    fontSize: 10,
    color: colors.white,
    fontFamily: 'Poppins-Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  loadingText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    marginTop: spacing.md,
    fontFamily: 'Poppins-Medium',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.secondary || 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontFamily: 'Poppins-Bold',
  },
  emptySubtext: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    fontFamily: 'Poppins-Regular',
  },
  emptyAction: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    ...shadows.sm,
  },
  emptyActionText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.white,
    fontFamily: 'Poppins-Medium',
  },
});

export default MasonryFeed;