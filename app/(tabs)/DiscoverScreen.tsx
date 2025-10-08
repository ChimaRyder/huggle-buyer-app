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
import { usePostContext } from '@/context/PostContext';
import type { BackendPost } from '@/types/BackendModels';

const { width } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const HORIZONTAL_PADDING = spacing.lg * 2; // left + right padding
const ITEM_SPACING = spacing.sm * (GRID_COLUMNS - 1); // spacing between items
const AVAILABLE_WIDTH = width - HORIZONTAL_PADDING - ITEM_SPACING;
const ITEM_SIZE = AVAILABLE_WIDTH / GRID_COLUMNS;

const DiscoverScreen = () => {
  const router = useRouter();
  const { 
    allPosts, 
    isFetchingPosts, 
    postsError, 
    fetchPosts, 
    refreshPosts 
  } = usePostContext();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshPosts();
    } catch (error) {
      console.error('Error refreshing posts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePostPress = (post: BackendPost) => {
    router.push(`/(screens)/store/PostScreen?id=${post.id}`);
  };


  const renderGridItem = ({ item: post, index }: { item: BackendPost; index: number }) => {
    // Keep all items the same size for consistent grid layout
    const itemWidth = ITEM_SIZE;
    const itemHeight = ITEM_SIZE;

    // Use first image or placeholder if no images
    const imageUri = post.imageUrls && post.imageUrls.length > 0 
      ? post.imageUrls[0] 
      : 'https://via.placeholder.com/400x400?text=No+Image';

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
          source={{ uri: imageUri }}
          style={styles.postImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Ionicons name="compass-outline" size={24} color={colors.primary.main} style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Discover</Text>
      </View>
    </View>
  );

  if (isFetchingPosts && allPosts.length === 0) {
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

  if (allPosts.length === 0 && !isFetchingPosts) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {renderHeader()}
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              colors={[colors.primary.main]}
              tintColor={colors.primary.main}
            />
          }
        >
          <Ionicons name="compass-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>
            {postsError ? 'Failed to load posts' : 'No posts available'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {postsError ? postsError : 'Check back later for new content from stores!'}
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {renderHeader()}
      
      <FlatList
        data={allPosts}
        renderItem={renderGridItem}
        numColumns={GRID_COLUMNS}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={[colors.primary.main]}
            tintColor={colors.primary.main}
          />
        }
        key={GRID_COLUMNS} // Force re-render when columns change
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.normal * typography.fontSizes.md,
  },
});

export default DiscoverScreen;