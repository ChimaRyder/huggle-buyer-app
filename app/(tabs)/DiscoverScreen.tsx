import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '@/constants/theme';
import { mockPosts } from '@/data/mockData';

const { width } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const HORIZONTAL_PADDING = spacing.lg * 2; // left + right padding
const ITEM_SPACING = spacing.sm * (GRID_COLUMNS - 1); // spacing between items
const AVAILABLE_WIDTH = width - HORIZONTAL_PADDING - ITEM_SPACING;
const ITEM_SIZE = AVAILABLE_WIDTH / GRID_COLUMNS;

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

const DiscoverScreen = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filter to show only grocery-related posts (posts with grocery store IDs or food-related content)
  const groceryPosts = mockPosts.filter(post => 
    post.storeId.includes('grocery') || 
    post.caption.toLowerCase().includes('fresh') ||
    post.caption.toLowerCase().includes('organic') ||
    post.caption.toLowerCase().includes('produce') ||
    post.caption.toLowerCase().includes('fruit') ||
    post.caption.toLowerCase().includes('vegetable') ||
    post.caption.toLowerCase().includes('berry') ||
    post.caption.toLowerCase().includes('herb')
  );

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      // Simulate API loading delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Sort posts by creation date (newest first) and mix in some non-grocery posts for variety
      const allPosts = [...groceryPosts, ...mockPosts.filter(p => !groceryPosts.includes(p)).slice(0, 3)];
      const sortedPosts = allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handlePostPress = (post: Post) => {
    router.push(`/(screens)/PostScreen?id=${post.id}`);
  };

  const formatLikes = (likes: number): string => {
    if (likes >= 1000) {
      return `${(likes / 1000).toFixed(1)}K`;
    }
    return likes.toString();
  };

  const renderGridItem = ({ item: post, index }: { item: Post; index: number }) => {
    // Keep all items the same size for consistent grid layout
    const itemWidth = ITEM_SIZE;
    const itemHeight = ITEM_SIZE;

    return (
      <TouchableOpacity
        style={[
          styles.gridItem,
          {
            width: itemWidth,
            height: itemHeight,
            marginRight: (index + 1) % GRID_COLUMNS !== 0 ? spacing.sm : 0,
          }
        ]}
        onPress={() => handlePostPress(post)}
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
              <Ionicons name="copy-outline" size={16} color={colors.text.primaryInverted} />
            </View>
          )}
          
          {/* Likes indicator */}
          <View style={styles.likesIndicator}>
            <Ionicons name="heart" size={14} color={colors.text.primaryInverted} />
            <Text style={styles.likesText}>{formatLikes(post.likes)}</Text>
          </View>
        </View>

        {/* Store info overlay for featured posts */}
        {(index === 0 || index % 9 === 0) && (
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
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Ionicons name="compass-outline" size={24} color={colors.primary} style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Discover</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          {Array.from({ length: 9 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.loadingItem,
                {
                  width: ITEM_SIZE,
                  height: ITEM_SIZE,
                  marginRight: (index + 1) % GRID_COLUMNS !== 0 ? spacing.sm : 0,
                  marginBottom: spacing.sm,
                }
              ]}
            />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {renderHeader()}
      
      <FlatList
        data={posts}
        renderItem={renderGridItem}
        numColumns={GRID_COLUMNS}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        key={GRID_COLUMNS} // Force re-render when columns change
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  gridContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  gridItem: {
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
    width: 20,
    height: 20,
    borderRadius: radii.full,
    marginRight: spacing.xs,
  },
  storeName: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.primaryInverted,
    fontWeight: typography.fontWeights.semibold,
    flex: 1,
  },
  // Loading states
  loadingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  loadingItem: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.lg,
  },
});

export default DiscoverScreen;