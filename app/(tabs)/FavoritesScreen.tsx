import React, { useState } from 'react';
import { View, Image, FlatList, StyleSheet } from 'react-native';
import { Layout, Text, Input, Button } from '@ui-kitten/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

const sampleFavorites = [
  {
    id: '1',
    name: 'Baked Bliss',
    category: 'Pastries',
    rating: 4.7,
    reviews: 120,
    distance: '1.2km',
    image: require('../../assets/images/sample-store.jpg'),
  },
  {
    id: '2',
    name: 'Snack Shack',
    category: 'Burgers',
    rating: 4.5,
    reviews: 98,
    distance: '0.8km',
    image: require('../../assets/images/sample-store.jpg'),
  },
];

const FavoritesScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<'Recents' | 'A-Z' | 'Z-A'>('Recents');

  const filteredFavorites = sampleFavorites
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortOption === 'A-Z') return a.name.localeCompare(b.name);
      if (sortOption === 'Z-A') return b.name.localeCompare(a.name);
      return 0; // Recents or default
    });

  interface Store {
    id: string;
    name: string;
    category: string;
    rating: number;
    reviews: number;
    distance: string;
    image: any;
  }

  const renderStoreItem = ({ item }: { item: Store }) => (
    <TouchableOpacity
    style={styles.storeItem}
    onPress={() => router.push(`/(screens)/StoreHomepageScreen?id=${item.id}`)}
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
      <Input
        placeholder="Search in Favorites"
        value={search}
        onChangeText={setSearch}
        accessoryLeft={() => <Ionicons name="search-outline" size={20} color="#8F9BB3" />}
        style={styles.searchBar}
      />

      <View style={styles.headerRow}>
        <Text category="h5" style={styles.headerTitle}>Favorites</Text>
        <Button
          appearance="ghost"
          status="basic"
          accessoryLeft={() => <Ionicons name="funnel-outline" size={24} color="#104911" />}
          onPress={() => {
            const next = sortOption === 'Recents' ? 'A-Z' : sortOption === 'A-Z' ? 'Z-A' : 'Recents';
            setSortOption(next);
          }}
        />
      </View>

      <FlatList
        data={filteredFavorites}
        keyExtractor={(item) => item.id}
        renderItem={renderStoreItem}
        contentContainerStyle={styles.list}
      />
    </Layout>
  );
};

export default FavoritesScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  searchBar: {
    marginTop: 10,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 100,
  },
  storeItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  storeImageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  storeImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  heartContainer: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#104911',
    borderRadius: 12,
    padding: 4,
  },
  storeTextSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 10,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  distanceText: {
    marginLeft: 4,
  },
});

