import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ReviewCard } from '../review';
import { colors, spacing, typography, radii, shadows } from '@/constants/theme';
import { BackendReview } from '../../types/BackendModels';

interface ReviewsPreviewProps {
  reviews: BackendReview[];
  loading?: boolean;
  onViewAll?: () => void;
  onWriteReview?: () => void;
  showWriteReviewButton?: boolean;
}

const ReviewsPreview: React.FC<ReviewsPreviewProps> = ({
  reviews,
  loading = false,
  onViewAll,
  onWriteReview,
  showWriteReviewButton = false,
}) => {
  const previewReviews = reviews.slice(0, 2);

  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 0.95)', 'rgba(249, 250, 251, 0.9)']}
      style={styles.container}
    >
      {/* Enhanced Section Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <LinearGradient
            colors={[colors.primary.main + '20', colors.primary.main + '10']}
            style={styles.titleIconContainer}
          >
            <Ionicons name="chatbubbles" size={20} color={colors.primary.main} />
          </LinearGradient>
          <View style={styles.titleTextContainer}>
            <Text style={styles.sectionTitle}>
              Reviews ({reviews.length})
            </Text>
            {reviews.length > 0 && (
              <LinearGradient
                colors={['#FFD700', '#FFC107']}
                style={styles.ratingContainer}
              >
                <Ionicons name="star" size={14} color={colors.white} />
                <Text style={styles.averageRating}>
                  {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
                </Text>
              </LinearGradient>
            )}
          </View>
        </View>
        
        {reviews.length > 2 && onViewAll && (
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
            <LinearGradient
              colors={[colors.primary.main + '15', colors.primary.main + '05']}
              style={styles.viewAllContainer}
            >
              <Text style={styles.viewAllButton}>View all</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary.main} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Enhanced Content */}
      {loading ? (
        <LinearGradient
          colors={[colors.primary.main + '10', colors.primary.main + '05']}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="small" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </LinearGradient>
      ) : reviews.length === 0 ? (
        <LinearGradient
          colors={['rgba(249, 250, 251, 0.8)', 'rgba(243, 244, 246, 0.6)']}
          style={styles.emptyContainer}
        >
          <LinearGradient
            colors={[colors.primary.main + '20', colors.primary.main + '10']}
            style={styles.emptyIconContainer}
          >
            <Ionicons name="chatbubbles-outline" size={32} color={colors.primary.main} />
          </LinearGradient>
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptySubtext}>
            Be the first to share your experience!
          </Text>
        </LinearGradient>
      ) : (
        <View style={styles.reviewsList}>
          {previewReviews.map((review, index) => (
            <LinearGradient
              key={review.id}
              colors={['rgba(255, 255, 255, 0.9)', 'rgba(249, 250, 251, 0.7)']}
              style={[styles.reviewItem, index > 0 && styles.reviewItemSpacing]}
            >
              <ReviewCard
                buyerId={review.buyerId}
                message={review.content || undefined}
                rating={review.rating}
                imageUrls={review.imageUrls || []}
                createdAt={review.createdAt}
                showExpandButton={true}
              />
            </LinearGradient>
          ))}
        </View>
      )}

      {/* Enhanced Write Review Button */}
      {showWriteReviewButton && onWriteReview && (
        <TouchableOpacity 
          style={styles.writeReviewButton}
          onPress={onWriteReview}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary.main, colors.primary.main + 'DD']}
            style={styles.writeReviewGradient}
          >
            <Ionicons name="create-outline" size={20} color={colors.white} />
            <Text style={styles.writeReviewText}>Write a Review</Text>
            <Ionicons name="star" size={16} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border.primary || 'rgba(0, 0, 0, 0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...shadows.xs,
  },
  titleTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
    marginRight: spacing.sm,
    fontFamily: 'Poppins-Medium',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    marginLeft: spacing.sm,
    ...shadows.xs,
  },
  averageRating: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginLeft: spacing.xs,
    fontFamily: 'Poppins-Bold',
  },
  viewAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    ...shadows.xs,
  },
  viewAllButton: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary.main,
    fontWeight: typography.fontWeights.medium,
    fontFamily: 'Poppins-Medium',
    marginRight: spacing.xs,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
  },
  loadingText: {
    marginLeft: spacing.sm,
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    fontFamily: 'Poppins-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    ...shadows.xs,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    fontFamily: 'Poppins-Medium',
  },
  emptySubtext: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  reviewsList: {
    marginBottom: spacing.lg,
  },
  reviewItem: {
    borderRadius: radii.lg,
    ...shadows.xs,
    overflow: 'hidden',
  },
  reviewItemSpacing: {
    marginTop: spacing.md,
  },
  writeReviewButton: {
    borderRadius: radii.xl,
    marginTop: spacing.md,
    ...shadows.md,
    overflow: 'hidden',
  },
  writeReviewGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  writeReviewText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    fontFamily: 'Poppins-Medium',
  },
});

export default ReviewsPreview;