import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, View, TextInput, Dimensions, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Text } from '@ui-kitten/components';
import MasonryList from '@react-native-seoul/masonry-list';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchSearchSuggestions } from '../../utils/api';

const { width } = Dimensions.get('window');
const numColumns = width > 400 ? 3 : 2;

const sampleData = [
  { id: '1', image: 'https://picsum.photos/200/300', height: 300 },
  { id: '2', image: 'https://picsum.photos/200/200', height: 200 },
  { id: '3', image: 'https://picsum.photos/200/400', height: 400 },
  { id: '4', image: 'https://picsum.photos/200/250', height: 250 },
  { id: '5', image: 'https://picsum.photos/200/350', height: 350 },
];

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (!query.trim()) return;
    router.push({
      pathname: '/(screens)/SearchResultsScreen',
      params: { query },
    });
  };

  const handleSuggestionPress = (item: any) => {
    if (!query.trim()) return;
    router.push({
      pathname: '/(screens)/SearchResultsScreen',
      params: { query },
    });
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: item.image }}
        style={[styles.image, { aspectRatio: 2 / 3 }]} // You can try 1 / 1 or 3 / 4 too
        resizeMode="cover"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for anything..."
          placeholderTextColor="#666"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>
      <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
        <Text style={styles.searchBtnText}>Search</Text>
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Recommended for you</Text>
        <View style={styles.divider} />
      </View>
      <MasonryList
        data={sampleData}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        contentContainerStyle={styles.masonryContainer}
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    marginTop: 35,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#000',
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
    color: '#333',
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    zIndex: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 6,
    marginHorizontal: 0,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  noSuggestions: {
    padding: 14,
    color: '#999',
    textAlign: 'center',
  },
  titleContainer: {
    marginTop: 60,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E1E1E1',
    width: '100%',
  },
  masonryContainer: {
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  itemContainer: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  typeToggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginHorizontal: 5,
  },
  typeToggleBtnActive: {
    backgroundColor: '#333',
  },
  typeToggleText: {
    color: '#333',
    fontWeight: 'bold',
  },
  typeToggleTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchBtn: {
    marginTop: 12,
    alignSelf: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 20,
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    width: '100%',
    borderRadius: 12,
  },
});

export default SearchScreen;
