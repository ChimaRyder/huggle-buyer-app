import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "@/constants/theme";
import ProductGrid from "@/components/product/ProductGrid";
import FeaturedPostCard from "@/components/posts/FeaturedPostCard";
import SafeImage from "@/components/common/SafeImage";
import { StoreSearchInput } from "@/components/store";
import { useStoreContext } from "@/context/StoreContext";
import type { BackendProduct } from "@/types/BackendModels";
// Get screen width for layout

// Store Homepage Skeleton Loading Component
const StoreHomepageSkeleton = () => {
  const skeletonStyles = {
    container: {
      flex: 1,
      backgroundColor: colors.background.tertiary,
    },
    skeletonBox: {
      backgroundColor: colors.background.secondary,
      borderRadius: 4,
    },
  };
  
  return (
    <View style={skeletonStyles.container}>
      {/* Banner skeleton */}
      <View style={[{ height: 200, position: 'relative' }, skeletonStyles.skeletonBox]} />
      
      {/* Store info skeleton */}
      <View style={{ padding: 20, paddingTop: 60, backgroundColor: colors.background.primary, borderBottomWidth: 1, borderBottomColor: colors.border.primary }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <View style={[skeletonStyles.skeletonBox, { height: 28, flex: 1, marginRight: 20 }]} />
          <View style={[skeletonStyles.skeletonBox, { width: 30, height: 30, borderRadius: 15 }]} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
          <View style={[skeletonStyles.skeletonBox, { height: 16, width: 120, marginRight: 10 }]} />
          <View style={[skeletonStyles.skeletonBox, { height: 16, width: 100 }]} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <View style={[skeletonStyles.skeletonBox, { width: 80, height: 28, borderRadius: 14, marginRight: 10 }]} />
          <View style={[skeletonStyles.skeletonBox, { width: 100, height: 28, borderRadius: 14, marginRight: 10 }]} />
        </View>
      </View>
      
      {/* Tab navigation skeleton */}
      <View style={{ flexDirection: 'row', backgroundColor: colors.background.primary, borderBottomWidth: 1, borderBottomColor: colors.border.primary }}>
        {[1, 2, 3, 4].map((index) => (
          <View key={index} style={{ flex: 1, paddingVertical: 15, alignItems: 'center' }}>
            <View style={[skeletonStyles.skeletonBox, { height: 16, width: 60 }]} />
          </View>
        ))}
      </View>
      
      {/* Content skeleton */}
      <ScrollView style={{ flex: 1, backgroundColor: colors.background.tertiary }}>
        <View style={{ padding: 20 }}>
          {/* Product grid skeleton */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={[skeletonStyles.skeletonBox, { width: '48%', height: 200, borderRadius: 12 }]} />
            <View style={[skeletonStyles.skeletonBox, { width: '48%', height: 200, borderRadius: 12 }]} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={[skeletonStyles.skeletonBox, { width: '48%', height: 200, borderRadius: 12 }]} />
            <View style={[skeletonStyles.skeletonBox, { width: '48%', height: 200, borderRadius: 12 }]} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default function StoreHomepageScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("Featured");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<BackendProduct[]>([]);
  
  // Store context
  const {
    currentStore,
    isFetchingStore,
    storeError,
    fetchStoreById,
    clearCurrentStore,
    storeProducts,
    isFetchingProducts,
    productsError,
    fetchStoreProducts,
    clearStoreProducts,
    isFollowingStore,
    followerCount,
    isFetchingFollowStatus,
    followError,
    followStore,
    unfollowStore,
    fetchFollowStatus,
    clearFollowStatus
  } = useStoreContext();
  
  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(storeProducts);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = storeProducts.filter((product) => {
      // Search in product name
      if (product.name.toLowerCase().includes(query)) {
        return true;
      }
      
      // Search in product description
      if (product.description && product.description.toLowerCase().includes(query)) {
        return true;
      }
      
      // Search in product type
      if (product.productType && product.productType.toLowerCase().includes(query)) {
        return true;
      }
      
      // Search in tags
      if (product.tags && Array.isArray(product.tags)) {
        return product.tags.some(tag => tag.toLowerCase().includes(query));
      }
      
      return false;
    });
    
    setFilteredProducts(filtered);
  }, [searchQuery, storeProducts]);
  
  // Handle search input change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };
  
  // Fetch store data when component mounts
  useEffect(() => {
    if (id && typeof id === 'string') {
      console.log('🔍 StoreHomepageScreen: Fetching store with ID:', id);
      fetchStoreById(id);
      fetchStoreProducts(id);
      fetchFollowStatus(id);
    }
    
    // Cleanup when component unmounts or ID changes
    return () => {
      clearCurrentStore();
      clearStoreProducts();
      clearFollowStatus();
    };
  }, [id, fetchStoreById, clearCurrentStore, fetchStoreProducts, clearStoreProducts, fetchFollowStatus, clearFollowStatus]);

  // Pull to refresh handler
  const onRefresh = async () => {
    if (!id || typeof id !== 'string') return;
    
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchStoreById(id),
        fetchStoreProducts(id),
        fetchFollowStatus(id)
      ]);
    } catch (error) {
      console.error('🔍 StoreHomepageScreen: Error during refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // TODO: Replace with API call to fetch featured products for this store
  const featuredProducts: any[] = []; // Will be fetched from API

  // TODO: Replace with API call to fetch store posts
  const storePosts: any[] = []; // Will be fetched from API

  // TODO: Replace with API call to fetch store categories
  const storeCategories: any[] = []; // Will be fetched from API

  // Loading state
  if (isFetchingStore) {
    return <StoreHomepageSkeleton />;
  }
  
  // Error state
  if (storeError || !currentStore) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Store not found</Text>
          <Text style={styles.errorText}>{storeError || 'The store you\'re looking for could not be found.'}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const toggleFavorite = async () => {
    if (!id || typeof id !== 'string') return;
    
    try {
      if (isFollowingStore) {
        await unfollowStore(id);
      } else {
        await followStore(id);
      }
    } catch (error) {
      console.error('🔍 StoreHomepageScreen: Error toggling follow status:', error);
    }
  };

  const handleChatWithSeller = () => {
    // TODO: Navigate to chat screen or messaging interface
    console.log('🔍 StoreHomepageScreen: Opening chat with seller for store:', id);
    // For now, we'll show an alert. Later this can be replaced with actual navigation
    // router.push(`/(screens)/chat/ChatScreen?storeId=${id}&sellerId=${currentStore.sellerId}`);
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const handleProductPress = (productId: string) => {
    router.push(`/(screens)/store/ProductScreen?id=${productId}`);
  };

  // Render category item
  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.categoryCard, { backgroundColor: item.color }]}
      onPress={() => console.log("Category pressed:", item.id)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );


  // Render featured tab content
  const renderFeaturedTab = () => {
    const productsToShow = searchQuery.trim() ? filteredProducts : storeProducts;
    
    return (
      <View style={styles.featuredTabContent}>
        {/* Search Input - only show if there are products */}
        {storeProducts.length > 0 && (
          <StoreSearchInput
            onSearchChange={handleSearchChange}
            placeholder={`Search ${storeProducts.length} products...`}
          />
        )}
        
        {/* Search Results Info */}
        {searchQuery.trim() && (
          <View style={styles.searchResultsInfo}>
            <Text style={styles.searchResultsText}>
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              {filteredProducts.length > 0 && ` for "${searchQuery}"`}
            </Text>
          </View>
        )}
        
        {/* Products Section */}
        {productsToShow.length > 0 ? (
          <View style={styles.productsSection}>
            <ProductGrid 
              products={productsToShow}
              onProductPress={handleProductPress}
            />
          </View>
        ) : storeProducts.length === 0 ? (
          <View style={styles.emptyContentContainer}>
            <Text style={styles.emptyContentText}>No featured products available</Text>
            <Text style={styles.emptyContentSubtext}>Featured products will appear here when available</Text>
          </View>
        ) : searchQuery.trim() && filteredProducts.length === 0 ? (
          <View style={styles.emptyContentContainer}>
            <Ionicons name="search-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyContentText}>No products found</Text>
            <Text style={styles.emptyContentSubtext}>
              No products match "{searchQuery}". Try different keywords.
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  // Render products tab content
  const renderProductsTab = () => {
    if (isFetchingProducts) {
      return (
        <View style={styles.tabContentWithSearch}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        </View>
      );
    }
    
    if (productsError) {
      return (
        <View style={styles.tabContentWithSearch}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load products</Text>
            <Text style={styles.errorSubtext}>{productsError}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => id && typeof id === 'string' && fetchStoreProducts(id)}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    const productsToShow = searchQuery.trim() ? filteredProducts : storeProducts;
    
    return (
      <View style={styles.tabContentWithSearch}>
        {/* Search Input - only show if there are products */}
        {storeProducts.length > 0 && (
          <StoreSearchInput
            onSearchChange={handleSearchChange}
            placeholder={`Search ${storeProducts.length} products...`}
          />
        )}
        
        {/* Search Results Info */}
        {searchQuery.trim() && (
          <View style={styles.searchResultsInfo}>
            <Text style={styles.searchResultsText}>
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              {filteredProducts.length > 0 && ` for "${searchQuery}"`}
            </Text>
            {filteredProducts.length === 0 && (
              <Text style={styles.searchNoResultsHint}>
                Try different keywords or check your spelling
              </Text>
            )}
          </View>
        )}
        
        {/* Products Grid or Empty State */}
        {productsToShow.length > 0 ? (
          <View style={styles.productsGridContainer}>
            <ProductGrid 
              products={productsToShow}
              onProductPress={handleProductPress}
            />
          </View>
        ) : storeProducts.length === 0 ? (
          <View style={styles.emptyContentContainer}>
            <Text style={styles.emptyContentText}>No products available</Text>
            <Text style={styles.emptyContentSubtext}>This store hasn't added any products yet</Text>
          </View>
        ) : searchQuery.trim() && filteredProducts.length === 0 ? (
          <View style={styles.emptyContentContainer}>
            <Ionicons name="search-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyContentText}>No products found</Text>
            <Text style={styles.emptyContentSubtext}>
              No products match "{searchQuery}". Try different keywords.
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  // Render posts tab content
  const renderPostsTab = () => (
    <View style={styles.postsTabFullContent}>
      {storePosts.length > 0 ? (
        <View style={styles.postsTabContent}>
          {storePosts.map((post) => (
            <FeaturedPostCard 
              key={post.id}
              post={post}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyPostsContainer}>
          <Text style={styles.emptyPostsText}>No posts available</Text>
          <Text style={styles.emptyContentSubtext}>Posts will appear here when available</Text>
        </View>
      )}
    </View>
  );

  // Render categories tab content
  const renderCategoriesTab = () => (
    <View style={styles.tabContent}>
      {storeCategories.length > 0 ? (
        <FlatList
          data={storeCategories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.categoryRow}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        />
      ) : (
        <View style={styles.emptyContentContainer}>
          <Text style={styles.emptyContentText}>No categories available</Text>
          <Text style={styles.emptyContentSubtext}>Categories will appear here when available</Text>
        </View>
      )}
    </View>
  );


  // Tab configuration
  const tabs = [
    { key: "Featured", label: "Featured" },
    { key: "Products", label: "Products" },
    { key: "Posts", label: "Posts" },
    { key: "Categories", label: "Categories" },
  ];

  return (
    <View style={styles.container}>
      {/* Fixed Back Button */}
      <TouchableOpacity 
        style={styles.fixedBackButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      
      {/* Main Scrollable Content */}
      <ScrollView 
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.main]}
            tintColor={colors.primary.main}
          />
        }
      >
        {/* Store Banner */}
        <View style={styles.bannerContainer}>
          {currentStore.coverImageUrl ? (
            <SafeImage 
              source={{ uri: currentStore.coverImageUrl }} 
              style={styles.bannerImage} 
            />
          ) : (
            <View style={styles.placeholderBanner}>
              <Text style={styles.placeholderText}>Store Image</Text>
            </View>
          )}
          
          {/* Overlapping Profile Image */}
          <View style={styles.overlappingProfileContainer}>
            {currentStore.profileImageUrl ? (
              <SafeImage 
                source={{ uri: currentStore.profileImageUrl }} 
                style={styles.overlappingProfileImage} 
              />
            ) : (
              <View style={styles.overlappingPlaceholderProfile}>
                <Ionicons name="storefront-outline" size={32} color={colors.text.secondary} />
              </View>
            )}
          </View>
        </View>

        {/* Store Info */}
        <View style={styles.storeInfo}>
          <View style={styles.storeHeader}>
            <Text style={styles.storeName}>{currentStore.name}</Text>
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.chatIconButton} onPress={handleChatWithSeller}>
                <Ionicons name="chatbubble-outline" size={20} color={colors.text.inverse} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.favoriteButton}
                onPress={toggleFavorite}
                disabled={isFetchingFollowStatus}
              >
                <Ionicons 
                  name={isFollowingStore ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFollowingStore ? colors.danger : colors.text.primary} 
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.storeDetails}>
            <Text style={styles.locationText}>
              {currentStore.city}, {currentStore.province}
              {currentStore.distance && ` • ${currentStore.distance.toFixed(1)}km`}
            </Text>
            <Text style={styles.dotSeparator}> • </Text>
            <View style={styles.storeStatusContainer}>
              <View style={[styles.statusDot, { backgroundColor: currentStore.isOpen ? colors.success : colors.error }]} />
              <Text style={[styles.statusText, { color: currentStore.isOpen ? colors.success : colors.error }]}>
                {currentStore.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
            {currentStore.isVerified && (
              <>
                <Text style={styles.dotSeparator}> • </Text>
                <View style={styles.verifiedContainer}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </>
            )}
          </View>
          {/* Expandable Description */}
          {currentStore.description && (
            <View style={styles.descriptionContainer}>
              <Text 
                style={styles.storeDescription} 
                numberOfLines={isDescriptionExpanded ? undefined : 2}
              >
                {currentStore.description}
              </Text>
              {currentStore.description.length > 100 && (
                <TouchableOpacity onPress={toggleDescription} style={styles.readMoreButton}>
                  <Text style={styles.readMoreText}>
                    {isDescriptionExpanded ? 'Read less' : 'Read more'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {currentStore.tags && currentStore.tags.length > 0 && (
            <View style={styles.categoriesContainer}>
              {currentStore.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={[styles.categoryBadge, { backgroundColor: colors.primary.main }]}>
                  <Text style={styles.categoryText}>{tag}</Text>
                </View>
              ))}
              {currentStore.tags.length > 3 && (
                <View style={[styles.categoryBadge, { backgroundColor: colors.background.secondary }]}>
                  <Text style={[styles.categoryText, { color: colors.text.primary }]}>
                    +{currentStore.tags.length - 3} more
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContentWrapper}>
          {activeTab === "Featured" && renderFeaturedTab()}
          {activeTab === "Products" && renderProductsTab()}
          {activeTab === "Posts" && renderPostsTab()}
          {activeTab === "Categories" && renderCategoriesTab()}
        </View>
        
        {/* Bottom spacing for better scrolling */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary, // Very light gray background
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
    color: colors.text.primary,
  },
  bannerContainer: {
    height: 200,
    position: "relative", // Keep for overlapping profile image
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  storeInfo: {
    padding: 20,
    paddingTop: 60, // Extra padding for overlapping profile image
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  storeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  favoriteButton: {
    padding: 5,
  },
  storeDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  locationText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  dotSeparator: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  ratingText: {
    fontSize: 16,
    color: colors.text.primary,
    marginRight: 3,
  },
  reviewsText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  reviewsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  promotionBanner: {
    backgroundColor: colors.dangerLight,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  promotionText: {
    color: colors.danger,
    fontWeight: "600",
    textAlign: "center",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 12,
    color: colors.text.inverse,
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary.main,
  },
  tabText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  activeTabText: {
    color: colors.primary.main,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  tabContent: {
    padding: 20,
  },
  tabContentWithSearch: {
    flex: 1,
  },
  searchResultsInfo: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
  },
  searchResultsText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  searchNoResultsHint: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  productsGridContainer: {
    padding: 20,
    flex: 1,
  },
  categoryContainer: {
    paddingBottom: 20,
  },
  categoryRow: {
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    height: 100,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
    color: colors.text.inverse,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.inverse,
    textAlign: "center",
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary.main,
    textAlign: "center",
    marginTop: 20,
  },
  featuredTabContent: {
    flex: 1,
  },
  postsSection: {
    backgroundColor: 'transparent',
    paddingTop: spacing.lg,
  },
  productsSection: {
    padding: 20,
    backgroundColor: colors.background.tertiary,
  },
  postsTabFullContent: {
    flex: 1,
  },
  postsTabContent: {
    backgroundColor: 'transparent',
    paddingTop: spacing.lg,
  },
  emptyPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyPostsText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: 20,
  },
  placeholderBanner: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyContentText: {
    fontSize: 18,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyContentSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  // New styles
  skeletonBox: {
    backgroundColor: colors.background.secondary,
    borderRadius: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  storeDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  storeStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
    marginLeft: 4,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  // Overlapping profile image styles
  overlappingProfileContainer: {
    position: 'absolute',
    bottom: -40,
    left: 20,
    zIndex: 10,
  },
  overlappingProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.background.primary,
    backgroundColor: colors.background.secondary,
  },
  overlappingPlaceholderProfile: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.background.primary,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Action buttons styles
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatIconButton: {
    backgroundColor: colors.success, // Green color
    borderRadius: 20,
    padding: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Expandable description styles
  descriptionContainer: {
    marginBottom: 16,
  },
  readMoreButton: {
    marginTop: 4,
  },
  readMoreText: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '600',
  },
  // Scrollable layout styles
  fixedBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
    zIndex: 20, // Higher than profile image
  },
  mainScrollView: {
    flex: 1,
  },
  tabContentWrapper: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  bottomSpacing: {
    height: 60, // Extra bottom space for better scrolling
  },
});
