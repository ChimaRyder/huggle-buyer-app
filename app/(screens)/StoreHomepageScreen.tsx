import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ReviewCard } from '../../components/ReviewCard';
import ProductGrid from '../../components/ProductGrid';

const { width, height } = Dimensions.get('window');
const BANNER_HEIGHT = height * 0.25;

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  date: string;
}

interface Store {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  distance: string;
  image: any;
  profileImage: any;
  bannerImage: any;
}

const MOCK_STORES: Store[] = [
  {
    id: '1',
    name: 'Baked Bliss',
    category: 'Pastries',
    rating: 4.7,
    reviews: 120,
    distance: '1.2km',
    image: require('../../assets/images/sample-store.jpg'),
    profileImage: require('../../assets/images/sample-store.jpg'),
    bannerImage: require('../../assets/images/sample-store.jpg'),
  },
  {
    id: '2',
    name: 'Snack Shack',
    category: 'Burgers',
    rating: 4.5,
    reviews: 98,
    distance: '0.8km',
    image: require('../../assets/images/sample-store.jpg'),
    profileImage: require('../../assets/images/sample-store.jpg'),
    bannerImage: require('../../assets/images/sample-store.jpg'),
  },
];

const DUMMY_REVIEWS: Review[] = [
  {
    id: '1',
    rating: 5,
    comment: "Great products and fast delivery!",
    userName: "John D.",
    date: "2025-05-10",
  },
  {
    id: '2',
    rating: 4,
    comment: "Good service and value for money.",
    userName: "Anna B.",
    date: "2025-05-09",
  },
];

export default function StoreHomepageScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const store = MOCK_STORES.find((s) => s.id === id?.toString());
  
  if (!store) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Store not found</Text>
      </SafeAreaView>
    );
  }
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeReviewIndex + 1) % DUMMY_REVIEWS.length;
      setActiveReviewIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [activeReviewIndex]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Banner */}
        <ImageBackground
          source={store.bannerImage}
          style={styles.banner}
        >
          <View style={styles.bannerOverlay}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.bannerBottom}>
              <View style={styles.storeInfo}>
                <Image
                  source={store.profileImage}
                  style={styles.storeProfileImage}
                />
                <View style={styles.storeTextInfo}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>{store.rating.toFixed(1)} ({store.reviews})</Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.circleButton}
                  onPress={() => setIsFavorited(!isFavorited)}
                >
                  <Ionicons
                    name={isFavorited ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isFavorited ? 'tomato' : 'black'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.circleButton, { marginTop: 8 }]}
                  onPress={() => router.push('/(screens)/chat' as any)}
                >
                  <Ionicons name="chatbubble-outline" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity onPress={() => router.push('/(screens)/reviews' as any)}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewsContainer}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setActiveReviewIndex(newIndex);
            }}
          >
            {DUMMY_REVIEWS.map((review) => (
              <View key={review.id} style={styles.reviewWrapper}>
                <ReviewCard
                  reviewerName={review.userName}
                  message={review.comment}
                  rating={review.rating}
                />
              </View>
            ))}
          </ScrollView>

          <View style={styles.paginationDots}>
            {DUMMY_REVIEWS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeReviewIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search in shop"
            placeholderTextColor="gray"
          />
        </View>



        {/* Popular Products */}
        <View style={styles.section}>
          <ProductGrid />
        </View>
      </ScrollView>

      {/* Floating Cart */}
      <TouchableOpacity
        style={styles.floatingCart}
        onPress={() => router.push('/(screens)/cart' as any)}
      >
        <Ionicons name="bag" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
    marginTop: 25,
  },
  scrollView: { flex: 1 },
  banner: { height: BANNER_HEIGHT },
  bannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'space-between',
    padding: 16,
  },
  closeButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  bannerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  storeInfo: { flexDirection: 'row', alignItems: 'center' },
  storeProfileImage: {
    width: 40, height: 40, borderRadius: 20, marginRight: 8,
  },
  storeTextInfo: { justifyContent: 'center' },
  storeName: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { color: 'white', marginLeft: 4 },
  actionButtons: { alignItems: 'center' },
  circleButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center', justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  searchInput: { flex: 1, marginLeft: 8 },
  section: { padding: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  popularHeader: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginLeft: 8 
  },
  seeAll: { 
    color: '#1E90FF' 
  },
  reviewsContainer: {
    paddingHorizontal: 16,
  },
  reviewWrapper: {
    width: width - 32,
    marginRight: 16,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  paginationDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#1E90FF',
    transform: [{ scale: 1.2 }],
  },
  floatingCart: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#1E90FF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
