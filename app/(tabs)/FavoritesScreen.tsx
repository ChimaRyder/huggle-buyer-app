import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Image,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Layout, Text, Input, Button } from "@ui-kitten/components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { fetchStoreById, fetchFollowedStores } from "@/utils/stores";
import { fetchBuyerById } from "@/utils/user";
import { BackendStore, BackendBuyer } from "../../types/BackendModels";
import { fontSizes, spacing, radii, shadows } from "../../constants/theme";
import ProductListCard from "../../components/ProductListCard";
import { fetchAllProducts, fetchProductsByStoreId } from "../../utils/products";
import { fetchPosts, getPostsByStoreId } from "../../utils/posts";

interface Store {
  id: string;
  name: string;
  category?: string;
  storeCategory?: string;
  rating: number;
  reviews: number;
  distance: string;
  image: any;
  storeImageUrl?: string;
}

const FavoritesScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId, getToken } = useAuth();
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState<"Recents" | "A-Z" | "Z-A">(
    "Recents"
  );
  const [favoriteStores, setFavoriteStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  const loadFavoriteStores = async () => {
    if (!userId) {
      setLoading(false);
      setError("Please log in to view your favorite stores");
      return;
    }

    try {
      if (!refreshing) {
        setLoading(true);
      }
      const token = await getToken({ template: "seller_app" });
      // Fetch followed stores using StoreFollower API
      const followed = await fetchFollowedStores(userId, token);
      if (!followed || followed.length === 0) {
        setFavoriteStores([]);
        setError("You don't have any favorite stores yet");
        setLoading(false);
        setRefreshing(false);
        return;
      }
      // Fetch details for each followed store
      const storesPromises = followed.map(async (f: any) => {
        try {
          const storeData = await fetchStoreById(f.storeId, token);
          return {
            id: storeData.id,
            name: storeData.name,
            category: storeData.storeCategory || "Store",
            rating: storeData.rating || 4.5,
            reviews: storeData.reviews || 0,
            distance: "Nearby",
            image: storeData.storeImageUrl
              ? { uri: storeData.storeImageUrl }
              : require("../../assets/images/sample-store.jpg"),
            storeImageUrl: storeData.storeImageUrl,
          };
        } catch (error) {
          console.error(`Error fetching store ${f.storeId}:`, error);
          return null;
        }
      });
      const stores = (await Promise.all(storesPromises)).filter(
        (store) => store !== null
      ) as Store[];
      setFavoriteStores(stores);
      setError(null);
    } catch (err) {
      console.error("Error loading favorite stores:", err);
      setError("Failed to load favorite stores");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch posts for favorite stores
  useEffect(() => {
    const loadPostsForFavorites = async () => {
      try {
        const tokenRaw = await getToken({ template: "seller_app" });
        const token = tokenRaw || "";
        let allPosts: any[] = [];
        for (const store of favoriteStores) {
          const storePosts = await getPostsByStoreId(token, store.id);
          if (Array.isArray(storePosts)) {
            // Ensure each post has a valid createdAt property
            const mappedPosts = storePosts.map((post) => ({
              ...post,
              createdAt:
                post.createdAt ||
                post.created_at ||
                post.dateCreated ||
                "1970-01-01T00:00:00Z",
            }));
            allPosts = allPosts.concat(mappedPosts);
          }
        }
        setPosts(allPosts);
      } catch (err) {
        // handle error
      }
    };
    if (favoriteStores.length > 0) {
      loadPostsForFavorites();
    }
  }, [favoriteStores, userId]);

  // Fetch all products for favorite stores
  useEffect(() => {
    const loadProductsForFavorites = async () => {
      try {
        const tokenRaw = await getToken({ template: "seller_app" });
        const token = tokenRaw || "";
        let allProducts: any[] = [];
        for (const store of favoriteStores) {
          const storeProducts = await fetchProductsByStoreId(store.id, token);
          if (Array.isArray(storeProducts)) {
            allProducts = allProducts.concat(storeProducts);
          }
        }
        setProducts(allProducts);
      } catch (err) {
        // handle error
      }
    };
    if (favoriteStores.length > 0) {
      loadProductsForFavorites();
    }
  }, [favoriteStores, userId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFavoriteStores();
  }, [userId]);

  useEffect(() => {
    loadFavoriteStores();
  }, [userId]);

  // Sort by date created (descending)
  const sortedItems = [...products, ...posts]
    .filter(
      (item) => !!item.createdAt && !isNaN(new Date(item.createdAt).getTime())
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

  const filteredFavorites = favoriteStores
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortOption === "A-Z") return a.name.localeCompare(b.name);
      if (sortOption === "Z-A") return b.name.localeCompare(a.name);
      return 0; // Recents or default
    });

  // Render favorite stores as horizontal FlatList
  const renderStoreCircle = ({ item }: { item: Store }) => (
    <TouchableOpacity
      style={{ alignItems: "center", marginRight: 18 }}
      onPress={() =>
        router.push(`/(screens)/StoreHomepageScreen?id=${item.id}`)
      }
    >
      <Image
        source={item.image}
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: "#eee",
        }}
      />
      <Text style={{ fontSize: 13, marginTop: 4 }}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Render product/post card (only image)
  const renderItemCard = ({ item }: { item: any }) => {
    const isProduct = item.discountedPrice !== undefined;
    const imageSource = isProduct
      ? item.coverImage
        ? { uri: item.coverImage }
        : require("../../assets/products/product1.png")
      : item.imageUrls && item.imageUrls.length > 0
      ? { uri: item.imageUrls[0] }
      : require("../../assets/products/product1.png");
    return (
      <TouchableOpacity
        style={{ marginBottom: 18, borderRadius: 16, overflow: "hidden" }}
        onPress={() =>
          router.push(
            isProduct
              ? {
                  pathname: "/(screens)/ProductScreen",
                  params: { id: item.id },
                }
              : { pathname: "/(screens)/PostScreen", params: { id: item.id } }
          )
        }
        activeOpacity={0.85}
      >
        <Image
          source={imageSource}
          style={{
            width: "100%",
            aspectRatio: 1.2,
            borderRadius: 16,
            backgroundColor: "#eee",
          }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  return (
    <Layout style={[styles.container]}>
      <Text category="h5" style={[styles.headerTitle, { marginBottom: 18 }]}>
        Favorite Stores
      </Text>
      <FlatList
        data={favoriteStores}
        keyExtractor={(item) => item.id}
        renderItem={renderStoreCircle}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          marginBottom: 18,
          paddingLeft: 2,
          paddingRight: 2,
        }}
        style={{ marginBottom: 8 }}
      />
      <FlatList
        data={sortedItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItemCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </Layout>
  );
};

export default FavoritesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  searchBar: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: 32,
  },
  list: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: fontSizes.md,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
    minHeight: 200,
  },
  emptyText: {
    fontSize: fontSizes.md,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    fontSize: fontSizes.md,
    color: "#FF6B6B",
    textAlign: "center",
  },
  storeItem: {
    flexDirection: "row",
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  storeImageWrapper: {
    position: "relative",
    marginRight: spacing.md,
  },
  storeImage: {
    width: 100,
    height: 100,
    borderRadius: radii.xl,
  },
  heartContainer: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "#104911",
    borderRadius: radii.md,
    padding: spacing.xs,
  },
  storeTextSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rating: {
    marginLeft: spacing.md,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  distanceText: {
    marginLeft: spacing.xs,
  },
  testButton: {
    marginBottom: spacing.lg,
    backgroundColor: "#FF5757",
  },
});
