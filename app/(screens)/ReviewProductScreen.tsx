import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Rating } from "react-native-ratings";
import { colors } from "@/constants/theme";

// Mock function to simulate image upload without Firebase
const mockUploadImage = async (uri: string, name: string, folder: string) => {
  // In a real app, you would upload to your own storage service
  // For now, we'll just return the local URI
  console.log(`Mock uploading ${name} to ${folder}`);
  return uri;
};

// Mock function to create a review without Firebase
const mockCreateReview = async (reviewData: any) => {
  // In a real app, you would send this to your backend
  console.log("Creating review:", reviewData);
  return { success: true, id: "mock-id-" + Date.now() };
};

const ReviewProductScreen = () => {
  const router = useRouter();
  const { productId, orderId, storeId } = useLocalSearchParams();
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

    const handlePostReview = async () => {
    if (!rating) {
      Alert.alert("Error", "Please provide a rating");
      return;
    }

    if (!reviewText.trim()) {
      Alert.alert("Error", "Please write a review");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images (using mock function)
      const uploadedImageUrls = [];
      for (const asset of selectedImages) {
        try {
          const name = `${Date.now()}_${asset.assetId || 'image'}.jpg`;
          const url = await mockUploadImage(asset.uri, name, "review_photos");
          uploadedImageUrls.push(url);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          Alert.alert("Upload Error", "Failed to upload one or more images");
          return;
        }
      }

      // Create review data
      const reviewData = {
        productId: productId as string,
        buyerId: user?.id,
        orderId: orderId as string,
        content: reviewText,
        imageUrls: uploadedImageUrls,
        rating: rating,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        storeId: storeId as string,
      };

      // Submit review (using mock function)
      const result = await mockCreateReview(reviewData);

      if (result.success) {
        Alert.alert("Success", "Your review has been posted!");
        router.back();
      } else {
        throw new Error("Failed to create review");
      }
    } catch (error) {
      console.error("Failed to post review:", error);
      Alert.alert("Error", "Failed to post review. Please try again.");
    } finally {
      setIsSubmitting(false);
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
