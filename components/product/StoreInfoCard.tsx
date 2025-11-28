import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii, shadows } from '@/constants/theme';

interface StoreInfoCardProps {
  storeName: string;
  location?: string;
  storeImageUrl?: string;
  onPress?: () => void;
}

const StoreInfoCard: React.FC<StoreInfoCardProps> = ({
  storeName,
  location,
  storeImageUrl,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(249, 250, 251, 0.9)']}
        style={styles.cardGradient}
      >
        <View style={styles.content}>
          {/* Enhanced Store Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              {storeImageUrl ? (
                <Image 
                  source={{ uri: storeImageUrl }} 
                  style={styles.avatar}
                />
              ) : (
                <LinearGradient
                  colors={[colors.primary.main + '20', colors.primary.main + '10']}
                  style={[styles.avatar, styles.avatarPlaceholder]}
                >
                  <Ionicons name="storefront" size={28} color={colors.primary.main} />
                </LinearGradient>
              )}
              <View style={styles.storeBadge}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success || '#10B981'} />
              </View>
            </View>
          </View>

          {/* Enhanced Store Info */}
          <View style={styles.infoContainer}>
            <View style={styles.storeHeader}>
              <Text style={styles.storeName} numberOfLines={1}>
                {storeName}
              </Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
            {location && (
              <View style={styles.locationRow}>
                <LinearGradient
                  colors={[colors.primary.main + '20', colors.primary.main + '10']}
                  style={styles.locationIconContainer}
                >
                  <Ionicons name="location" size={12} color={colors.primary.main} />
                </LinearGradient>
                <Text style={styles.location} numberOfLines={1}>
                  {location}
                </Text>
              </View>
            )}
            <Text style={styles.visitStoreText}>Tap to visit store</Text>
          </View>

          {/* Enhanced Arrow Icon */}
          {onPress && (
            <LinearGradient
              colors={[colors.primary.main + '15', colors.primary.main + '05']}
              style={styles.arrowContainer}
            >
              <Ionicons name="chevron-forward" size={20} color={colors.primary.main} />
            </LinearGradient>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: radii.xl,
    ...shadows.md,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary || 'rgba(0, 0, 0, 0.08)',
    borderRadius: radii.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: spacing.lg,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background.secondary || 'rgba(0, 0, 0, 0.05)',
    ...shadows.sm,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.white,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  infoContainer: {
    flex: 1,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  storeName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    fontFamily: 'Poppins-Bold',
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: colors.success + '15' || '#10B981' + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  verifiedText: {
    fontSize: typography.fontSizes.xs,
    color: colors.success || '#10B981',
    fontFamily: 'Poppins-Medium',
    fontWeight: typography.fontWeights.medium,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  locationIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  location: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  visitStoreText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary.main,
    fontFamily: 'Poppins-Medium',
    fontWeight: typography.fontWeights.medium,
  },
  arrowContainer: {
    marginLeft: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xs,
  },
});

export default StoreInfoCard;