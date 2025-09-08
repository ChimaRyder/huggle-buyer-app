import React from 'react';
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
import { colors, spacing, typography, radii } from '@/constants/theme';

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

interface PostCardProps {
  post: Post;
  size?: 'small' | 'medium' | 'large';
  showStoreInfo?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  size = 'medium', 
  showStoreInfo = false 
}) => {
  const router = useRouter();

  const formatLikes = (likes: number): string => {
    if (likes >= 1000) {
      return `${(likes / 1000).toFixed(1)}K`;
    }
    return likes.toString();
  };

  const handlePress = () => {
    router.push(`/(screens)/store/PostScreen?id=${post.id}`);
  };

  // Calculate size based on prop
  const getSize = () => {
    const padding = spacing.lg * 2;
    const available = width - padding;
    
    switch (size) {
      case 'small':
        return (available - spacing.sm * 2) / 3; // 3 columns
      case 'large':
        return available - spacing.sm; // Full width minus margin
      case 'medium':
      default:
        return (available - spacing.sm) / 2; // 2 columns
    }
  };

  const cardSize = getSize();

  return (
    <TouchableOpacity
      style={[
        styles.postCard,
        {
          width: cardSize,
          height: size === 'large' ? cardSize * 0.75 : cardSize,
        }
      ]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: post.images[0] }}
        style={styles.postImage}
        resizeMode="cover"
      />
      
      {/* Overlay with post info */}
      <View style={styles.overlay}>
        {/* Multiple images indicator */}
        {post.images.length > 1 && (
          <View style={styles.multipleImagesIndicator}>
            <Ionicons name="copy-outline" size={14} color={colors.text.primaryInverted} />
          </View>
        )}
        
        {/* Likes indicator */}
        <View style={styles.likesIndicator}>
          <Ionicons name="heart" size={12} color={colors.text.primaryInverted} />
          <Text style={styles.likesText}>{formatLikes(post.likes)}</Text>
        </View>
      </View>

      {/* Store info overlay */}
      {showStoreInfo && (
        <View style={styles.storeOverlay}>
          <Image
            source={{ uri: post.storeAvatar }}
            style={styles.storeAvatar}
          />
          <Text style={styles.storeName} numberOfLines={1}>
            {post.storeName}
          </Text>
        </View>
      )}

      {/* Caption overlay for large posts */}
      {size === 'large' && (
        <View style={styles.captionOverlay}>
          <Text style={styles.caption} numberOfLines={2}>
            {post.caption}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  postCard: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    position: 'relative',
    backgroundColor: colors.background.primary,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  multipleImagesIndicator: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radii.xl,
    padding: 4,
  },
  likesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radii.xl,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  likesText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.primaryInverted,
    marginLeft: 4,
    fontWeight: typography.fontWeights.semibold,
  },
  storeOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  storeAvatar: {
    width: 18,
    height: 18,
    borderRadius: radii.full,
    marginRight: spacing.xs,
  },
  storeName: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.primaryInverted,
    fontWeight: typography.fontWeights.semibold,
    flex: 1,
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  caption: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.primaryInverted,
    lineHeight: 16,
  },
});

export default PostCard;