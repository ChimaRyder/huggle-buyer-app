import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { fetchSearchResults } from '../../utils/api';

interface Product {
  id: string;
  name: string;
  tags: string[];
  type: string;
  sales: number;
  rating: number;
  price: number;
}
interface Store {
  id: string;
  name: string;
  tags: string[];
  rating: number;
}
interface Post {
  id: string;
  storeId: string;
  content: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
  interactions: number;
}

const FILTERS = [
  { key: 'type', label: 'Product Type' },
  { key: 'sales', label: 'No. of Sales' },
  { key: 'rating', label: 'Rating' },
  { key: 'price', label: 'Price' },
];

const SearchResultsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { query } = route.params as { query: string };
  const [storeResults, setStoreResults] = useState<Store[]>([]);
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommended, setRecommended] = useState<Post[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const { stores, products } = await fetchSearchResults(query);
        setStoreResults(Array.isArray(stores) ? stores : []);
        setProductResults(Array.isArray(products) ? products : []);
      } catch (err) {
        setStoreResults([]);
        setProductResults([]);
        setError('Failed to fetch search results.');
      } finally {
        setLoading(false);
      }
    })();
    // Fetch recommended posts (dummy data)
    setRecommended([
      {
        id: 'post1',
        storeId: '1',
        content: 'Special offer!',
        imageUrls: ['https://picsum.photos/200/300'],
        createdAt: '2025-07-12T10:30:41.022Z',
        updatedAt: '2025-07-12T10:30:41.022Z',
        interactions: 10,
      },
    ]);
  }, [query]);

  const renderStore = ({ item }: { item: Store }) => (
    <View style={styles.resultItem}>
      <Text style={styles.resultTitle}>{item.name}</Text>
      <Text>Rating: {item.rating}</Text>
      {'tags' in item && <Text>Tags: {item.tags.join(', ')}</Text>}
    </View>
  );
  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.resultItem}>
      <Text style={styles.resultTitle}>{item.name}</Text>
      <Text>Type: {item.type}</Text>
      <Text>Sales: {item.sales}</Text>
      <Text>Rating: {item.rating}</Text>
      <Text>Price: ${item.price}</Text>
      {'tags' in item && <Text>Tags: {item.tags.join(', ')}</Text>}
    </View>
  );



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Results</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#333" style={{ marginTop: 32 }} />
      ) : error ? (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 32 }}>{error}</Text>
      ) : (
        <>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginLeft: 16, marginTop: 8 }}>Stores</Text>
          <FlatList
            data={storeResults}
            keyExtractor={(item) => item.id}
            renderItem={renderStore}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 16 }}>No stores found.</Text>}
          />
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginLeft: 16, marginTop: 24 }}>Products</Text>
          <FlatList
            data={productResults}
            keyExtractor={(item) => item.id}
            renderItem={renderProduct}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 16 }}>No products found.</Text>}
          />
        </>
      )}
      <View style={styles.recommendedSection}>
        <Text style={styles.recommendedTitle}>Recommended for you (nearby sellers)</Text>
        <FlatList
          data={recommended}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.recommendedItem}>
              <Text>{item.content}</Text>
              {item.imageUrls[0] && (
                <View style={styles.recommendedImageWrapper}>
                  <MaterialIcons name="store" size={24} color="#333" />
                  <Text>Store: {item.storeId}</Text>
                </View>
              )}
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 16 },
  filterContainer: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8 },
  filterButton: { padding: 8, backgroundColor: '#eee', borderRadius: 8, marginRight: 8 },
  filterButtonActive: { backgroundColor: '#333' },
  filterText: { color: '#333' },
  resultItem: { padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  resultTitle: { fontWeight: 'bold', fontSize: 16 },
  recommendedSection: { marginTop: 16, paddingHorizontal: 16 },
  recommendedTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  recommendedItem: { backgroundColor: '#f7f7f7', padding: 12, borderRadius: 8, marginRight: 12 },
  recommendedImageWrapper: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
});

export default SearchResultsScreen;
