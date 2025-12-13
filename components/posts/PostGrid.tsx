import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radii, typography } from '@/constants/theme';
import SafeImage from '@/components/common/SafeImage';
import { Ionicons } from '@expo/vector-icons';
import type { BackendPost } from '@/types/BackendModels';

const { width } = Dimensions.get('window');

interface PostGridProps {
  posts: BackendPost[];
  onPostPress?: (post: BackendPost) => void;
  numColumns?: number;
}

const PostGrid: React.FC<PostGridProps> = ({
  posts,
  onPostPress,
  numColumns = 2
}) => {
  const router = useRouter();

  const handlePostPress = (post: BackendPost) => {
    if (onPostPress) {
      onPostPress(post);
    } else {
      router.push(`/(screens)/store/PostScreen?id=${post.id}`);
    }
  };

  const renderPost = (item: BackendPost, index: number) => {
    const padding = spacing.lg;
    const gap = spacing.sm;
    const availableWidth = width - (padding * 2);
    const itemWidth = (availableWidth - (gap * (numColumns - 1))) / numColumns;

    // Calculate if this item needs right margin (not the last in a row)
    const isLastInRow = (index + 1) % numColumns === 0;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.postCard,
          {
            width: itemWidth,
            height: itemWidth,
            marginRight: isLastInRow ? 0 : gap,
            marginBottom: gap,
          }
        ]}
        onPress={() => handlePostPress(item)}
        activeOpacity={0.9}
      >
        {item.imageUrls && item.imageUrls.length > 0 ? (
          <SafeImage
            source={{ uri: item.imageUrls[0] }}
            style={styles.postImage}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons
              name="image-outline"
              size={32}
              color={colors.text.tertiary}
            />
          </View>
        )}

        {/* Post overlay with like count */}
        {item.likeCount > 0 && (
          <View style={styles.overlay}>
            <View style={styles.likesContainer}>
              <Ionicons
                name="heart"
                size={16}
                color={colors.danger}
              />
              <Text style={styles.likesCount}>{item.likeCount}</Text>
            </View>
          </View>
        )}

        {/* Multiple images indicator */}
        {item.imageUrls && item.imageUrls.length > 1 && (
          <View style={styles.multipleIndicator}>
            <Ionicons
              name="copy-outline"
              size={16}
              color={colors.text.inverse}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="images-outline" size={64} color={colors.text.tertiary} />
      <Text style={styles.emptyTitle}>No posts yet</Text>
      <Text style={styles.emptySubtitle}>
        This store hasn't shared any posts yet
      </Text>
    </View>
  );

  if (posts.length === 0) {
    return renderEmpty();
  }

  // Use View-based grid instead of FlatList to avoid VirtualizedList nesting issues
  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {posts.map((post, index) => renderPost(post, index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  row: {
    justifyContent: 'flex-start',
  },
  postCard: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.primary,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.tertiary,
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: radii.sm,
  },
  likesCount: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    marginLeft: spacing.xs / 2,
  },
  multipleIndicator: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: radii.full,
    padding: spacing.xs / 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
    minHeight: 200,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
  },
});

export default PostGrid;