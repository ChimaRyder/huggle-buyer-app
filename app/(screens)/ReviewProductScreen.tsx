import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@clerk/clerk-expo";
import { createReview } from "../../utils/reviews";
import { getOrders } from "../../utils/orders";

const ReviewProductScreen = () => {
  const router = useRouter();
  const { productId, orderId } = useLocalSearchParams();
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const { userId, getToken } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets) {
      setImageUris([
        ...imageUris,
        ...result.assets.map((a: { uri: string }) => a.uri),
      ]);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const token = await getToken({ template: "seller_app" });
    if (!userId) {
      Alert.alert("User not authenticated");
      setSubmitting(false);
      return;
    }
    const buyerId = String(userId);
    let finalOrderId: string | null = null;
    if (orderId) {
      finalOrderId = typeof orderId === "string" ? orderId : orderId[0];
    } else {
      // fallback: try to find a completed order for this product
      try {
        const orders = await getOrders(token);
        const completedOrder = orders.find((order: any) => {
          const isCompleted = order.status === 3 || order.status === "3";
          const hasProduct =
            order.productId &&
            (Array.isArray(order.productId)
              ? order.productId.includes(productId)
              : order.productId === productId);
          return isCompleted && hasProduct;
        });
        if (completedOrder) {
          finalOrderId = completedOrder.id;
        }
      } catch (e) {
        Alert.alert("Could not fetch orders to find orderId");
        setSubmitting(false);
        return;
      }
    }
    if (!finalOrderId) {
      Alert.alert("No completed order found for this product.");
      setSubmitting(false);
      return;
    }
    const reviewData = {
      productId:
        typeof productId === "string"
          ? productId
          : Array.isArray(productId)
          ? productId[0]
          : "",
      buyerId,
      orderId: finalOrderId,
      content,
      imageUrls: [],
      rating,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await createReview(token, reviewData);
      Alert.alert("Review submitted!");
      router.back();
    } catch (e) {
      Alert.alert("Error submitting review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Review product</Text>
      <Text style={styles.subtitle}>How was the product?</Text>
      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((num) => (
          <TouchableOpacity key={num} onPress={() => setRating(num)}>
            <Text style={[styles.star, rating >= num && styles.starSelected]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Review</Text>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Share your experience"
        multiline
        style={styles.reviewInput}
        maxLength={500}
      />
      <Text style={styles.label}>Images (optional)</Text>
      <View style={styles.imageRow}>
        {[0, 1, 2, 3].map((idx) =>
          imageUris[idx] ? (
            <Image
              key={idx}
              source={{ uri: imageUris[idx] }}
              style={styles.imageSlot}
            />
          ) : (
            <TouchableOpacity
              key={idx}
              onPress={handlePickImage}
              style={styles.imageSlot}
              disabled={imageUris.length >= 4}
            >
              <Text style={styles.addImageText}>+</Text>
            </TouchableOpacity>
          )
        )}
      </View>
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={submitting}
        activeOpacity={0.8}
      >
        <Text style={styles.submitButtonText}>
          {submitting ? "Submitting..." : "Submit review"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "left",
  },
  subtitle: {
    fontSize: 16,
    color: "#444",
    marginBottom: 8,
    textAlign: "left",
    fontWeight: "500",
  },
  label: {
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 6,
    fontSize: 15,
    color: "#444",
  },
  ratingRow: {
    gap: 8,
    flexDirection: "row",
    marginBottom: 12,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center", // Center the row
  },
  star: {
    fontSize: 50,
    color: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center", // Center the star itself
  },
  starSelected: {
    color: "#FFD700",
    textShadowColor: "#FFD700",
    textShadowRadius: 2,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 16,
    padding: 14,
    minHeight: 100,
    marginTop: 2,
    fontSize: 16,
    backgroundColor: "#fafbfc",
    textAlignVertical: "top",
  },
  imageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 18,
    gap: 8,
  },
  imageSlot: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#bbb",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f6f6f6",
    marginRight: 0,
    overflow: "hidden",
  },
  addImageText: { fontSize: 32, color: "#bbb", fontWeight: "bold" },
  submitButton: {
    backgroundColor: "#548C2F",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
    marginBottom: 12,
    shadowColor: "#548C2F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
});

export default ReviewProductScreen;
