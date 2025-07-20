import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getOrders } from '../../utils/api';
import { fetchBuyerById } from '../../utils/api';
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

  useEffect(() => {
    const checkEligibility = async () => {
      setLoading(true);
      const token = await tokenCache.getToken('accessToken');
      // Fetch buyerId from token or user context
      let buyerId = null;
      try {
        const user = await fetchBuyerById('me', token); // Assuming 'me' returns current user
        buyerId = user.id;
      } catch (e) {
        setLoading(false);
        return;
      }
      // Fetch all orders and check if any completed order contains this product
      const orders = await getOrders(token ?? null);
      const completedOrder = orders.find((order: any) =>
        order.status === 'Completed' &&
        order.productId &&
        (Array.isArray(order.productId)
          ? order.productId.includes(productId)
          : order.productId === productId)
      );
      // Fetch reviews for this product to check if already reviewed
      const res = await fetch(`${API_BASE_URL}/api/reviews?productId=${productId}`);
      const reviews = await res.json();
      const hasReviewed = reviews.some((rev: any) => rev.buyerId === buyerId);
      setAlreadyReviewed(hasReviewed);
      setIsEligible(!!completedOrder && !hasReviewed);
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
    let buyerId = null;
    try {
      const user = await fetchBuyerById('me', token);
      buyerId = user.id;
    } catch (e) {
      Alert.alert('Could not get user info.');
      setLoading(false);
      return;
    }
    // TODO: Upload images and get URLs if needed
    const reviewData = {
      productId,
      buyerId,
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

  if (!isEligible) return (
    <View style={styles.center}>
      <Text>
        {alreadyReviewed
          ? 'You have already reviewed this product.'
          : 'You can only review products you have ordered and completed.'}
      </Text>
    </View>
  );

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
