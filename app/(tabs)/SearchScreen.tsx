import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  TextInput,
  Dimensions,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Text } from "@ui-kitten/components";
import MasonryList from "@react-native-seoul/masonry-list";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { fetchPosts } from "../../utils/api";
import { useAuth } from "@clerk/clerk-expo";

const { width } = Dimensions.get("window");
const numColumns = width > 400 ? 3 : 2;

// Removed sampleData. We'll fetch real posts from the backend.

const SearchScreen = () => {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceTimeout = useRef<number | null>(null);
  const router = useRouter();
  const { getToken } = useAuth();

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (!query.trim()) {
      setShowDropdown(false);
      setDebouncedQuery("");
      return;
    }
    debounceTimeout.current = setTimeout(() => {
      setDebouncedQuery(query);
      setShowDropdown(true);
    }, 400);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [query]);

  useEffect(() => {
    const fetchBackendPosts = async () => {
      try {
        const token = await getToken({ template: "seller_app" });
        const postsData = await import("../../utils/api").then((mod) =>
          mod.fetchPosts(token)
        );
        setPosts(postsData);
      } catch (error) {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBackendPosts();
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    setShowDropdown(false);
    // Default to stores if searching directly
    router.push({
      pathname: "/(screens)/SearchResultsScreen",
      params: { query, searchProducts: "false" },
    });
  };

  const handleDropdownPress = (searchProducts: boolean) => {
    setShowDropdown(false);
    router.push({
      pathname: "/(screens)/SearchResultsScreen",
      params: { query, searchProducts: searchProducts ? "true" : "false" },
    });
  };

  const renderItem = ({ item }: any) => {
    // Use the first imageUrl if available, fallback to a placeholder
    const imageUrl =
      Array.isArray(item.imageUrls) && item.imageUrls.length > 0
        ? item.imageUrls[0]
        : "https://via.placeholder.com/200x300?text=No+Image";
    return (
      <View style={styles.itemContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { aspectRatio: 2 / 3 }]}
          resizeMode="cover"
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ position: "relative" }}>
        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={24}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for anything..."
            placeholderTextColor="#666"
            value={query}
            onChangeText={setQuery}
            onFocus={() => {
              if (debouncedQuery) setShowDropdown(true);
            }}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        {showDropdown && debouncedQuery.trim() !== "" && (
          <View style={styles.suggestionsDropdown}>
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => handleDropdownPress(false)}
            >
              <Text style={styles.suggestionText}>
                {debouncedQuery} <Text style={{ color: "#666" }}>[stores]</Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => handleDropdownPress(true)}
            >
              <Text style={styles.suggestionText}>
                {debouncedQuery}{" "}
                <Text style={{ color: "#666" }}>[products]</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
        <Text style={styles.searchBtnText}>Search</Text>
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Recommended for you</Text>
        <View style={styles.divider} />
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#333"
          style={{ marginTop: 40 }}
        />
      ) : (
        <MasonryList
          data={posts}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          contentContainerStyle={styles.masonryContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    marginTop: 35,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  suggestionsDropdown: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    zIndex: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 6,
    marginHorizontal: 0,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionText: {
    fontSize: 16,
    color: "#333",
  },
  noSuggestions: {
    padding: 14,
    color: "#999",
    textAlign: "center",
  },
  titleContainer: {
    marginTop: 60,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#E1E1E1",
    width: "100%",
  },
  masonryContainer: {
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  itemContainer: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeToggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  typeToggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#eee",
    marginHorizontal: 5,
  },
  typeToggleBtnActive: {
    backgroundColor: "#333",
  },
  typeToggleText: {
    color: "#333",
    fontWeight: "bold",
  },
  typeToggleTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  searchBtn: {
    marginTop: 12,
    alignSelf: "center",
    backgroundColor: "#333",
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 20,
  },
  searchBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  image: {
    width: "100%",
    borderRadius: 12,
  },
});

export default SearchScreen;
