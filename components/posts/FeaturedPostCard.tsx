import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii, shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface Post {
  id: string;
  storeId: string;
  storeName: string;
  storeAvatar: string;
  images: string[];
  caption: string;
  likes: number;
  createdAt: string;
}

interface FeaturedPostCardProps {
  post: Post;
}

const FeaturedPostCard: React.FC<FeaturedPostCardProps> = ({ post }) => {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatLikes = (likes: number): string => {
    if (likes >= 1000000) {
      return `${(likes / 1000000).toFixed(1)}M`;
    }
    if (likes >= 1000) {
      return `${(likes / 1000).toFixed(1)}K`;
    }
    return likes.toString();
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return `${Math.floor(diffInDays / 7)}w`;
  };

  const handlePress = () => {
    router.push(`/(screens)/PostScreen?id=${post.id}`);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleStorePress = () => {
    router.push(`/(screens)/StoreHomepageScreen?id=${post.storeId}`);
  };

  return (
    <View style={styles.containerWrapper}>
      <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.95}>
        {/* Image */}
        <View>
          <Image 
            source={{ uri: post.images[currentImageIndex] }} 
            style={styles.postImage} 
            resizeMode="cover" 
          />
          
          {/* Image indicator dots */}
          {post.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {post.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentImageIndex && styles.activeIndicator
                  ]}
                />
              ))}
            </View>
          )}
        </View>

      {/* Heart action with likes count */}
      <View style={styles.actions}>
        <Text style={styles.likesText}>
          {formatLikes(isLiked ? post.likes + 1 : post.likes)} likes
        </Text>
        <TouchableOpacity 
          style={styles.heartButton} 
          onPress={(e) => {
            e.stopPropagation();
            handleLike();
          }}
        >
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={24} 
            color={isLiked ? colors.primary : colors.text.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      <View style={styles.captionContainer}>
        <Text style={styles.caption} numberOfLines={3}>
          <Text style={styles.storeNameInCaption}>{post.storeName}</Text>
          {' '}{post.caption}
        </Text>
        <Text style={styles.timeAgo}>{formatTime(post.createdAt)}</Text>
      </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  postImage: {
    width: width - (spacing.md * 2),
    height: width - (spacing.md * 2),
    backgroundColor: colors.background.tertiary,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs / 2,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  heartButton: {
    padding: spacing.xs,
  },
  likesText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  captionContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  caption: {
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    lineHeight: typography.lineHeights.normal * typography.fontSizes.md,
  },
  storeNameInCaption: {
    fontWeight: typography.fontWeights.semibold,
  },
  timeAgo: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});

export default FeaturedPostCard;