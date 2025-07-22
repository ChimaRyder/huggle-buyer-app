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
import { fetchStoreById } from "@/utils/stores";
import { fetchBuyerById } from "@/utils/user";
import { BackendStore, BackendBuyer } from "../../types/BackendModels";
import { fontSizes, spacing, radii, shadows } from "../../constants/theme";

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

      // Fetch buyer data to get favorite store IDs
      const buyerData = await fetchBuyerById(userId, token);

      if (!buyerData.favoriteStores || buyerData.favoriteStores.length === 0) {
        setFavoriteStores([]);
        setError("You don't have any favorite stores yet");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Fetch details for each favorite store
      const storesPromises = buyerData.favoriteStores.map(
        async (storeId: string) => {
          try {
            const storeData = await fetchStoreById(storeId, token);
            return {
              id: storeData.id,
              name: storeData.name,
              category: storeData.storeCategory || "Store",
              rating: storeData.rating || 4.5,
              reviews: storeData.reviews || 0,
              distance: "Nearby", // This would need location calculation in a real app
              image: storeData.storeImageUrl
                ? { uri: storeData.storeImageUrl }
                : require("../../assets/images/sample-store.jpg"),
              storeImageUrl: storeData.storeImageUrl,
            };
          } catch (error) {
            console.error(`Error fetching store ${storeId}:`, error);
            return null;
          }
        }
      );

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFavoriteStores();
  }, [userId]);

  useEffect(() => {
    loadFavoriteStores();
  }, [userId]);

  const filteredFavorites = favoriteStores
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortOption === "A-Z") return a.name.localeCompare(b.name);
      if (sortOption === "Z-A") return b.name.localeCompare(a.name);
      return 0; // Recents or default
    });

  const renderStoreItem = ({ item }: { item: Store }) => (
    <TouchableOpacity
      style={styles.storeItem}
      onPress={() =>
        router.push(`/(screens)/StoreHomepageScreen?id=${item.id}`)
      }
      activeOpacity={0.8}
    >
      <View style={styles.storeImageWrapper}>
        <Image source={item.image} style={styles.storeImage} />
        <View style={styles.heartContainer}>
          <Ionicons name="heart" size={14} color="white" />
        </View>
      </View>

      <View style={styles.storeTextSection}>
        <View style={styles.titleRow}>
          <Text category="h6">{item.name}</Text>
          <Text appearance="hint" style={styles.rating}>
            ⭐ {item.rating} ({item.reviews})
          </Text>
        </View>
        <Text appearance="hint">{item.category}</Text>
        <View style={styles.distanceRow}>
          <Ionicons name="walk" size={16} color="#104911" />
          <Text appearance="hint" style={styles.distanceText}>
            {item.distance}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Layout style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <Text category="h5" style={styles.headerTitle}>
          Favorites
        </Text>
      </View>

      {/* Add empty state illustration and message if no favorites */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#548C2F" />
          <Text style={styles.loadingText}>Loading favorite stores...</Text>
        </View>
      ) : error && favoriteStores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="heart-dislike"
            size={48}
            color="#E0E0E0"
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFavorites}
          keyExtractor={(item) => item.id}
          renderItem={renderStoreItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#548C2F"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="heart-outline"
                size={48}
                color="#E0E0E0"
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.emptyText}>No favorite stores found</Text>
            </View>
          }
        />
      )}
    </Layout>
  );
};

export default FavoritesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
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
    fontSize: fontSizes.lg,
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
