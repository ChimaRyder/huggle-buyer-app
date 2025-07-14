import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { MaterialIcons, Ionicons, FontAwesome } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { fetchSearchResults } from "../../utils/api";
import { formatPrice } from "../../utils/product";

// Use backend models for type safety
import { BackendProduct, BackendStore } from "../../types/BackendModels";

type SearchResult =
  | (BackendProduct & { _type: "product" })
  | (BackendStore & { _type: "store" });

const FILTERS = [
  { key: "type", label: "Product Type" },
  { key: "sales", label: "No. of Sales" },
  { key: "rating", label: "Rating" },
  { key: "price", label: "Price" },
];

const SearchResultsScreen = () => {
  const route = useRoute();
  const router = useRouter();
  const { getToken } = useAuth();
  const { query } = route.params as { query: string };
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simple scoring: prioritize name/category match, then rating
  const computeScore = useCallback(
    (item: BackendProduct | BackendStore): number => {
      let score = 0;
      const q = query.toLowerCase();
      // For products
      if ("productType" in item) {
        if (item.name?.toLowerCase().includes(q)) score += 10;
        if (item.productType?.toLowerCase().includes(q)) score += 6;
        if (item.category?.some((cat) => cat.toLowerCase().includes(q)))
          score += 5;
        score += item.rating || 0;
      } else {
        // For stores
        if (item.name?.toLowerCase().includes(q)) score += 10;
        if (item.storeCategory?.toLowerCase().includes(q)) score += 6;
        if (item.tags?.some((tag: string) => tag.toLowerCase().includes(q)))
          score += 3;
        score += item.rating || 0;
      }
      return score;
    },
    [query]
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const token = await getToken({ template: "seller_app" });
        const { products } = await fetchSearchResults(query, true, token);
        // Mark type for each
        const productItems: SearchResult[] = (products || []).map(
          (p: BackendProduct) => ({ ...p, _type: "product" })
        );
        // Score and sort
        const all = productItems.map((item) => ({
          ...item,
          _score: computeScore(item),
        }));
        all.sort((a, b) => (b._score || 0) - (a._score || 0));
        setResults(all);
      } catch (err) {
        setResults([]);
        setError("Failed to fetch search results.");
      } finally {
        setLoading(false);
      }
    })();
  }, [query, computeScore]);

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

  // Top result
  const topResult = results.length > 0 ? results[0] : null;
  const secondaryResults = results.slice(1);

  // Render pill search bar
  const renderSearchBar = () => (
    <View style={styles.searchBarContainer}>
      <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
        <Ionicons name="arrow-back" size={22} color="#333" />
      </TouchableOpacity>
      <View style={styles.searchBarPill}>
        <Text style={styles.searchBarText} numberOfLines={1}>
          {query}
        </Text>
      </View>
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="filter" size={22} color="#333" />
      </TouchableOpacity>
    </View>
  );

  // Render best match
  const renderTopResult = () => {
    if (!topResult) return null;
    const isProduct = topResult._type === "product";
    const imageUrl = isProduct ? topResult.coverImage : topResult.storeImageUrl;
    const name = topResult.name;
    const tags = isProduct
      ? topResult.category
      : [topResult.storeCategory, ...(topResult.tags || [])];
    const rating = topResult.rating || 0;
    const distance = "240m"; // TODO: Replace with real geo distance if available
    return (
      <TouchableOpacity
        style={styles.topCard}
        onPress={() => handlePress(topResult)}
      >
        <Image
          source={imageUrl ? { uri: imageUrl } : undefined}
          style={styles.topCardImage}
          resizeMode="cover"
        />
        <View style={styles.topCardContent}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.topCardTitle}>{name}</Text>
            <TouchableOpacity>
              <FontAwesome name="heart-o" size={22} color="#e74c3c" />
            </TouchableOpacity>
          </View>
          <Text style={styles.topCardTags} numberOfLines={1}>
            {Array.isArray(tags) ? tags.filter(Boolean).join(" · ") : tags}
          </Text>
          <View style={styles.topCardRow}>
            <MaterialIcons name="location-on" size={16} color="#888" />
            <Text style={styles.topCardDistance}>{distance}</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 16,
              }}
            >
              <MaterialIcons name="star" size={16} color="#fbc02d" />
              <Text style={styles.topCardRating}>{rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render secondary matches
  const renderSecondaryItem = ({ item }: { item: SearchResult }) => {
    const isProduct = item._type === "product";
    const imageUrl = isProduct ? item.coverImage : item.storeImageUrl;
    const name = item.name;
    const tags = isProduct
      ? item.category
      : [item.storeCategory, ...(item.tags || [])];
    const rating = item.rating || 0;
    const distance = "240m"; // TODO: Replace with real geo distance if available
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
            <TouchableOpacity>
              <FontAwesome name="heart-o" size={18} color="#e74c3c" />
            </TouchableOpacity>
          </View>
          <Text style={styles.secondaryCardTags} numberOfLines={1}>
            {Array.isArray(tags) ? tags.filter(Boolean).join(" · ") : tags}
          </Text>
          <View style={styles.topCardRow}>
            <MaterialIcons name="location-on" size={14} color="#888" />
            <Text style={styles.secondaryCardDistance}>{distance}</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 12,
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
  };

  return (
    <View style={styles.container}>
      {renderSearchBar()}
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
        <>
          <Text style={styles.sectionTitle}>Best Match</Text>
          {renderTopResult()}
          <Text style={styles.sectionTitle}>Similar stuff near you</Text>
          <FlatList
            data={secondaryResults}
            keyExtractor={(item) => item.id}
            renderItem={renderSecondaryItem}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", marginTop: 16 }}>
                No similar results found.
              </Text>
            }
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        </>
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
});

export default SearchResultsScreen;
