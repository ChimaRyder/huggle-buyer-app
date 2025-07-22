import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getOrders } from '../../utils/api';
import { useAuth } from '@clerk/clerk-expo';
import { fetchReviews } from '../../utils/reviews';
import { tokenCache } from '../../utils/cache';

const API_BASE_URL = "https://huggle-backend-jh2l.onrender.com";

const ReviewProductScreen = () => {
  const router = useRouter();
  const { productId } = useLocalSearchParams();
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [isEligible, setIsEligible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [storeReviews, setStoreReviews] = useState<any[]>([]);
  const { userId } = useAuth();

  useEffect(() => {
    const checkEligibility = async () => {
      setLoading(true);
      const token = await tokenCache.getToken('accessToken');
      // Use Clerk userId as buyerId
      const buyerId = userId;
      let orders = [];
      try {
        orders = await getOrders(token ?? null);
      } catch (e) {
        console.log('Error fetching orders:', e);
      }
      // Case-insensitive check for completed orders containing this product
      const completedOrder = orders.find((order: any) => {
        const isCompleted = String(order.status).toLowerCase() === 'completed';
        const hasProduct = order.productId && (Array.isArray(order.productId)
          ? order.productId.includes(productId)
          : order.productId === productId);
        return isCompleted && hasProduct;
      });
      // Fetch reviews for this product to check if already reviewed
      let reviews = [];
      try {
        reviews = await fetchReviews(token, { productId });
      } catch (e) {
        console.log('Error fetching reviews:', e);
      }
      setStoreReviews(reviews);
      const hasReviewed = reviews.some((rev: any) => rev.buyerId === buyerId);
      setAlreadyReviewed(hasReviewed);
      setIsEligible(!!completedOrder); // Allow review even if already reviewed
      setLoading(false);
    };
    checkEligibility();
  }, [productId]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets) {
      setImageUris([
        ...imageUris,
        ...result.assets.map((a: { uri: string }) => a.uri)
      ]);
    }
  };

  const handleSubmit = async () => {
    if (!content || rating === 0) {
      Alert.alert('Please provide both a rating and review content.');
      return;
    }
    setLoading(true);
    const token = await tokenCache.getToken('accessToken');
    // Use Clerk userId as buyerId
    const buyerId = userId;
    // Find the completed order for this product
    let orderId = null;
    let orders = [];
    try {
      orders = await getOrders(token ?? null);
    } catch (e) {
      console.log('Error fetching orders for review submit:', e);
    }
    const completedOrder = orders.find((order: any) => {
      const isCompleted = String(order.status).toLowerCase() === 'completed';
      const hasProduct = order.productId && (Array.isArray(order.productId)
        ? order.productId.includes(productId)
        : order.productId === productId);
      return isCompleted && hasProduct;
    });
    if (completedOrder) {
      orderId = completedOrder.id;
    }
    // TODO: Upload images and get URLs if needed
    const reviewData = {
      productId: typeof productId === 'string' ? productId : (Array.isArray(productId) ? productId[0] : ''),
      buyerId,
      orderId,
      content,
      imageUrls: [], // For now, skip image upload
      rating,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });
      if (!res.ok) throw new Error('Failed to submit review');
      Alert.alert('Review submitted!');
      router.back();
    } catch (e) {
      Alert.alert('Error submitting review.');
    }
    setLoading(false);
  };

  if (loading) return (
    <View style={styles.center}><Text>Loading...</Text></View>
  );

  if (!isEligible) {
    return (
      <View style={styles.center}>
        <Text>You can only review products you have ordered and completed.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Write a Review</Text>
      <Text style={styles.label}>Rating</Text>
      <View style={styles.ratingRow}>
        {[1,2,3,4,5].map(num => (
          <TouchableOpacity key={num} onPress={() => setRating(num)}>
            <Text style={[styles.star, rating >= num && styles.starSelected]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Review</Text>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Share your experience..."
        multiline
        style={styles.input}
      />
      <Text style={styles.label}>Images (optional)</Text>
      <View style={styles.imageRow}>
        {imageUris.map((uri, idx) => (
          <Image key={idx} source={{ uri }} style={styles.image} />
        ))}
        <TouchableOpacity onPress={handlePickImage} style={styles.addImageBtn}>
          <Text style={styles.addImageText}>+</Text>
        </TouchableOpacity>
      </View>
      <Button title="Submit Review" onPress={handleSubmit} disabled={loading} />
      {/* Store Reviews Section */}
      <Text style={[styles.label, { marginTop: 32 }]}>Store Reviews</Text>
      {storeReviews.length === 0 ? (
        <Text style={{ color: '#666', marginTop: 8 }}>No reviews yet.</Text>
      ) : (
        storeReviews.map((rev, idx) => (
          <View key={idx} style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: 'bold' }}>{rev.buyerName || 'Anonymous'}</Text>
            <Text style={{ color: '#444' }}>{rev.content}</Text>
            <Text style={{ color: '#FFD700' }}>Rating: {rev.rating}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  label: { fontWeight: 'bold', marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, minHeight: 80, marginTop: 8 },
  ratingRow: { flexDirection: 'row', marginTop: 8 },
  star: { fontSize: 32, color: '#ccc', marginRight: 8 },
  starSelected: { color: '#FFD700' },
  imageRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 8 },
  addImageBtn: { width: 60, height: 60, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center' },
  addImageText: { fontSize: 32, color: '#aaa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
});

export default ReviewProductScreen;
