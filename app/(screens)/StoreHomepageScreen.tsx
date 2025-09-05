import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { restaurants, foodItems, foodCategories } from "@/data/food/mockData";
import { colors, spacing } from "@/constants/theme";
import ProductGrid from "@/components/product/ProductGrid";
import FeaturedPostCard from "@/components/posts/FeaturedPostCard";
import { mockPosts } from "@/data/mockData";

// Mock reviews data
const mockReviews = [
  {
    id: "1",
    buyerId: "user1",
    message: "Great service and fresh produce!",
    rating: 5,
    imageUrls: [],
    createdAt: "2023-05-15T10:30:00Z",
    showExpandButton: true,
  },
  {
    id: "2",
    buyerId: "user2",
    message: "Fast delivery and excellent quality.",
    rating: 4,
    imageUrls: [],
    createdAt: "2023-05-10T14:20:00Z",
    showExpandButton: true,
  },
];

export default function StoreHomepageScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("Featured");

  // Find the store in mock data
  const store = restaurants.find(restaurant => restaurant.id === id);

  // Filter products for this store (using first 3 restaurants as examples)
  const storeProducts = foodItems.filter(item => {
    if (id === "1") return ["101", "102", "103"].includes(item.id);
    if (id === "2") return ["201", "202"].includes(item.id);
    if (id === "3") return ["301", "302"].includes(item.id);
    return false;
  });

  // Get featured products (popular items)
  const featuredProducts = storeProducts.filter(item => item.isPopular);

  // Get posts for this store (map restaurant IDs to post store IDs)
  const storeIdMap = {
    "1": "grocery-1", // Farm Fresh Market
    "2": "grocery-5", // Organic Harvest Co.
    "3": "grocery-6", // Tropical Paradise
    "4": "grocery-2", // Green Thumb Grocers -> Green Valley Grocers
    "5": "grocery-4", // Berry Best -> Berry Best Market  
    "6": "grocery-7"  // Root Cellar -> Garden Fresh Market
  };
  
  const postStoreId = storeIdMap[id as keyof typeof storeIdMap];
  const storePosts = mockPosts.filter(post => 
    post.storeId === postStoreId
  ).slice(0, 6); // Limit to 6 posts for the featured section

  // Get categories for this store
  const storeCategories = foodCategories.filter(category => 
    store?.categories.includes(category.name)
  );

  // If store not found, show error
  if (!store) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Store not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Check if the promotion is about free delivery
  const isFreeDeliveryPromo = store.promotion && store.promotion.toLowerCase().includes('free delivery');

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleProductPress = (productId: string) => {
    router.push(`/(screens)/ProductScreen?id=${productId}`);
  };

  // Render category item
  const renderCategoryItem = ({ item }: { item: typeof foodCategories[0] }) => (
    <TouchableOpacity 
      style={[styles.categoryCard, { backgroundColor: item.color }]}
      onPress={() => console.log("Category pressed:", item.id)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Render featured tab content
  const renderFeaturedTab = () => (
    <View style={styles.featuredTabContent}>
      {/* Posts Section */}
      {storePosts.length > 0 && (
        <View style={styles.postsSection}>
          {storePosts.map((post) => (
            <FeaturedPostCard 
              key={post.id}
              post={post}
            />
          ))}
        </View>
      )}

      {/* Products Section */}
      {featuredProducts.length > 0 && (
        <View style={styles.productsSection}>
          <ProductGrid 
            products={featuredProducts}
            onProductPress={handleProductPress}
          />
        </View>
      )}
    </View>
  );

  // Render products tab content
  const renderProductsTab = () => (
    <View style={styles.tabContent}>
      <ProductGrid 
        products={storeProducts}
        onProductPress={handleProductPress}
      />
    </View>
  );

  // Render categories tab content
  const renderCategoriesTab = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={storeCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.categoryRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      />
    </View>
  );

  // Render reviews tab content
  const renderReviewsTab = () => (
    <View style={styles.tabContent}>
      {mockReviews.map((review) => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewerName}>Customer {review.id}</Text>
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, i) => (
                <Ionicons 
                  key={i}
                  name="star" 
                  size={14} 
                  color={i < review.rating ? colors.warning : colors.text.tertiary} 
                />
              ))}
            </View>
          </View>
          <Text style={styles.reviewText}>{review.message}</Text>
          <Text style={styles.reviewDate}>
            {new Date(review.createdAt).toLocaleDateString()}
          </Text>
        </View>
      ))}
    </View>
  );

  // Tab configuration
  const tabs = [
    { key: "Featured", label: "Featured" },
    { key: "Products", label: "Products" },
    { key: "Categories", label: "Categories" },
    { key: "Reviews", label: "Reviews" },
  ];

  return (
    <View style={styles.container}>
      {/* Store Banner */}
      <View style={styles.bannerContainer}>
        <Image 
          source={{ uri: store.image }} 
          style={styles.bannerImage} 
        />
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Store Info with Favorite Button */}
      <View style={styles.storeInfo}>
        <View style={styles.storeHeader}>
          <Text style={styles.storeName}>{store.name}</Text>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={toggleFavorite}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? colors.danger : colors.text.primary} 
            />
          </TouchableOpacity>
        </View>
        <View style={styles.storeDetails}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={colors.warning} />
            <Text style={styles.ratingText}>{store.rating}</Text>
          </View>
          <Text style={styles.deliveryInfo}>
            {store.distance}
          </Text>
        </View>
        {store.promotion && !isFreeDeliveryPromo && (
          <View style={styles.promotionBanner}>
            <Text style={styles.promotionText}>{store.promotion}</Text>
          </View>
        )}
        <View style={styles.categoriesContainer}>
          {store.categories.map((categoryName, index) => {
            // Find the category in foodCategories to get its color
            const category = foodCategories.find(cat => cat.name === categoryName);
            const backgroundColor = category ? category.color : colors.primary;
            
            return (
              <View 
                key={index} 
                style={[styles.categoryBadge, { backgroundColor }]}
              >
                <Text style={styles.categoryText}>{categoryName}</Text>
              </View>
            );
          })}
        </View>
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
      <ScrollView style={styles.contentContainer}>
        {activeTab === "Featured" && renderFeaturedTab()}
        {activeTab === "Products" && renderProductsTab()}
        {activeTab === "Categories" && renderCategoriesTab()}
        {activeTab === "Reviews" && renderReviewsTab()}
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
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 10,
  },
  storeInfo: {
    padding: 20,
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
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
    color: colors.text.primary,
  },
  deliveryInfo: {
    fontSize: 16,
    color: colors.text.secondary,
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
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  tabContent: {
    padding: 20,
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
  reviewCard: {
    backgroundColor: colors.background.secondary,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  reviewText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
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
});
