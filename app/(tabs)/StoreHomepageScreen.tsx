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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const BANNER_HEIGHT = height * 0.25;

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  date: string;
}

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
          source={{ uri: 'https://placeholder-store-image.jpg' }}
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
                  source={{ uri: 'https://placeholder-profile.jpg' }}
                  style={styles.storeProfileImage}
                />
                <View style={styles.storeTextInfo}>
                  <Text style={styles.storeName}>Store Name</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>4.8 (120)</Text>
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
                  onPress={() => router.push({ pathname: '/chat' })}
                >
                  <Ionicons name="chatbubble-outline" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search in shop"
            placeholderTextColor="gray"
          />
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/reviews' })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setActiveReviewIndex(newIndex);
            }}
          >
            {DUMMY_REVIEWS.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewUserName}>{review.userName}</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text>{review.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
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

        {/* Popular Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.popularHeader}>
              <Ionicons name="flame" size={24} color="#FF4500" />
              <Text style={styles.sectionTitle}>Popular</Text>
            </View>
          </View>
          {/* TODO: Product grid */}
        </View>
      </ScrollView>

      {/* Floating Cart */}
      <TouchableOpacity
        style={styles.floatingCart}
        onPress={() => router.push({ pathname: '/cart' })}
      >
        <Ionicons name="bag" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  seeAll: { color: '#1E90FF' },
  reviewCard: {
    width: width - 32,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewUserName: { fontWeight: 'bold' },
  reviewComment: { marginBottom: 8 },
  reviewDate: { color: 'gray', fontSize: 12 },
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
