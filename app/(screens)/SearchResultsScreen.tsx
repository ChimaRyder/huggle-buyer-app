import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { MaterialIcons, Ionicons, FontAwesome } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { fetchSearchResults } from "@/utils/stores";
import ProductGrid from "../../components/ProductGrid";
import ProductListCard from "../../components/ProductListCard";

// Use backend models for type safety
import { BackendProduct, BackendStore } from "../../types/BackendModels";

type SearchResult =
  | (BackendProduct & { _type: "product" })
  | (BackendStore & { _type: "store" });

const FILTERS = [
  { key: "rating", label: "Rating" },
  { key: "price", label: "Price" },
  { key: "stock", label: "Stocks Left" },
];

const SearchResultsScreen = () => {
  const route = useRoute();
  const router = useRouter();
  const { getToken } = useAuth();
  const { query, searchProducts } = route.params as {
    query: string;
    searchProducts?: string;
  };
  const isProduct = searchProducts === "true";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("rating");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const token = await getToken({ template: "seller_app" });
        const { products } = await fetchSearchResults(query, isProduct, token);
        // Mark type for each
        const productItems: SearchResult[] = (products || []).map(
          (p: BackendProduct) => ({
            ...p,
            _type: isProduct ? "product" : "store",
          })
        );
        setResults(productItems);
      } catch (err) {
        setResults([]);
        setError("Failed to fetch search results.");
      } finally {
        setLoading(false);
      }
    })();
  }, [query, isProduct]);

  const handlePress = (item: SearchResult) => {
    if (item._type === "product") {
      router.push({
        pathname: "/(screens)/ProductScreen",
        params: { id: item.id },
      });
    } else {
      router.push({
        pathname: "/(screens)/StoreHomepageScreen",
        params: { id: item.id },
      });
    }
  };

  // Sorting logic
  const getSortedResults = () => {
    if (!isProduct) return results;
    const sorted = [...results].sort((a, b) => {
      if (a._type !== "product" || b._type !== "product") return 0;
      let aValue = 0;
      let bValue = 0;
      switch (selectedFilter) {
        case "rating":
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case "price":
          aValue = a.discountedPrice || 0;
          bValue = b.discountedPrice || 0;
          break;
        case "stock":
          aValue = a.stock || 0;
          bValue = b.stock || 0;
          break;
        default:
          break;
      }
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });
    return sorted;
  };

  // Render pill search bar
  const renderSearchBar = () => (
    <View style={styles.searchBarContainer}>
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/SearchScreen")}
        style={styles.iconButton}
      >
        <Ionicons name="arrow-back" size={22} color="#333" />
      </TouchableOpacity>
      <View style={styles.searchBarPill}>
        <Text style={styles.searchBarText} numberOfLines={1}>
          {query}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => router.push("/(tabs)/SearchScreen")}
      >
        <Ionicons name="search" size={22} color="#333" />
      </TouchableOpacity>
    </View>
  );

  // Updated filter bar
  const renderFilters = () => {
    if (!isProduct) return null;
    return (
      <View
        style={{ flexDirection: "row", paddingHorizontal: 16, marginBottom: 8 }}
      >
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={{
              marginRight: 12,
              backgroundColor:
                selectedFilter === filter.key ? "#F9A620" : "#eee",
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 6,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text
              style={{
                fontSize: 13,
                color: selectedFilter === filter.key ? "#fff" : "#555",
              }}
            >
              {filter.label}
            </Text>
            {selectedFilter === filter.key && (
              <TouchableOpacity
                onPress={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                style={{ marginLeft: 6 }}
              >
                <MaterialIcons
                  name={sortOrder === "asc" ? "arrow-upward" : "arrow-downward"}
                  size={16}
                  color="#fff"
                />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render result item
  const renderResultItem = ({ item }: { item: SearchResult }) => {
    if (item._type === "product") {
      return (
        <ProductListCard
          id={item.id}
          name={item.name}
          image={item.coverImage ? { uri: item.coverImage } : undefined}
          discount={
            item.originalPrice > 0
              ? Math.round(
                  ((item.originalPrice - item.discountedPrice) /
                    item.originalPrice) *
                    100
                )
              : 0
          }
          availableItems={item.stock}
          rating={item.rating || 4.5}
          expirationDate={item.expirationDate}
          price={item.discountedPrice}
          storeId={item.storeId}
          onPress={() => handlePress(item)}
          onStorePress={() =>
            router.push(`/(screens)/StoreHomepageScreen?id=${item.storeId}`)
          }
        />
      );
    } else {
      const imageUrl = item.storeImageUrl;
      const name = item.name;
      const tags = [item.storeCategory, ...(item.tags || [])];
      const rating = item.rating || 0;
      return (
        <TouchableOpacity
          style={styles.secondaryCard}
          onPress={() => handlePress(item)}
        >
          <Image
            source={imageUrl ? { uri: imageUrl } : undefined}
            style={styles.secondaryCardImage}
            resizeMode="cover"
          />
          <View style={styles.secondaryCardContent}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={styles.secondaryCardTitle}>{name}</Text>
            </View>
            <Text style={styles.secondaryCardTags} numberOfLines={1}>
              {Array.isArray(tags) ? tags.filter(Boolean).join(" · ") : tags}
            </Text>
            <View style={styles.topCardRow}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialIcons name="star" size={14} color="#fbc02d" />
                <Text style={styles.secondaryCardRating}>
                  {rating.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={styles.container}>
      {renderSearchBar()}
      {renderFilters()}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#333"
          style={{ marginTop: 32 }}
        />
      ) : error ? (
        <Text style={{ color: "red", textAlign: "center", marginTop: 32 }}>
          {error}
        </Text>
      ) : (
        <FlatList
          style={{ marginHorizontal: 16, marginTop: 16 }}
          data={getSortedResults()}
          keyExtractor={(item) => item.id}
          renderItem={renderResultItem}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 32, color: "#888" }}>
              No results found.
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  iconButton: {
    padding: 8,
  },
  searchBarPill: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 24,
    backgroundColor: "#f1f1f1",
    paddingVertical: 8,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 36,
  },
  searchBarText: {
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 18,
    marginTop: 18,
    marginBottom: 8,
    color: "#222",
  },
  topCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 20,
    flexDirection: "row",
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    minHeight: 120,
  },
  topCardImage: {
    width: 110,
    height: 110,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    backgroundColor: "#eaeaea",
  },
  topCardContent: {
    flex: 1,
    padding: 14,
    justifyContent: "center",
  },
  topCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d2d2d",
    flex: 1,
    marginRight: 8,
  },
  topCardTags: {
    marginTop: 4,
    color: "#666",
    fontSize: 13,
    marginBottom: 4,
  },
  topCardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  topCardDistance: {
    marginLeft: 4,
    color: "#888",
    fontSize: 13,
  },
  topCardRating: {
    marginLeft: 3,
    color: "#222",
    fontWeight: "bold",
    fontSize: 14,
  },
  secondaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f6f6",
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
  },
  secondaryCardImage: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: "#eaeaea",
  },
  secondaryCardContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  secondaryCardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2d2d2d",
    flex: 1,
    marginRight: 8,
  },
  secondaryCardTags: {
    marginTop: 2,
    color: "#666",
    fontSize: 12,
    marginBottom: 2,
  },
  secondaryCardDistance: {
    marginLeft: 4,
    color: "#888",
    fontSize: 12,
  },
  secondaryCardRating: {
    marginLeft: 3,
    color: "#222",
    fontWeight: "bold",
    fontSize: 13,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F8FA", //F7F8FA
  },
});

export default SearchResultsScreen;
