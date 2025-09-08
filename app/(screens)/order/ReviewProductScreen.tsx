import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { colors, spacing, typography } from "@/constants/theme";
import { foodItems } from "@/data/food/mockData";

// Mock function to simulate image upload
const mockUploadImage = async (uri: string, name: string, folder: string) => {
  console.log(`Mock uploading ${name} to ${folder}`);
  return uri;
};

// Mock function to create a review
const mockCreateReview = async (reviewData: any) => {
  console.log("Creating review:", reviewData);
  return { success: true, id: "mock-id-" + Date.now() };
};

export default function ReviewProductScreen() {
  const router = useRouter();
  const { productId, orderId, storeId } = useLocalSearchParams();
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Get product details for display
  const product = foodItems.find(item => item.id === productId);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets) {
      const newUris = result.assets.map((asset) => asset.uri);
      setImageUris(prev => [...prev, ...newUris].slice(0, 4)); // Limit to 4 images
    }
  };

  const removeImage = (index: number) => {
    setImageUris(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!rating) {
      Alert.alert("Error", "Please provide a rating");
      return;
    }

    if (!content.trim()) {
      Alert.alert("Error", "Please write a review");
      return;
    }

    setSubmitting(true);

    try {
      // Upload images
      const uploadedImageUrls = [];
      for (const uri of imageUris) {
        try {
          const name = `${Date.now()}_image.jpg`;
          const url = await mockUploadImage(uri, name, "review_photos");
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
        content: content,
        imageUrls: uploadedImageUrls,
        rating: rating,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        storeId: storeId as string,
      };

      // Submit review
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
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Write Review</Text>
          {product && (
            <Text style={styles.headerSubtitle}>{product.name}</Text>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How would you rate this product?</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((num) => (
              <TouchableOpacity 
                key={num} 
                onPress={() => setRating(num)}
                style={styles.starButton}
              >
                <Ionicons
                  name="star"
                  size={40}
                  color={rating >= num ? colors.warning : colors.border.primary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Review Text Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share your experience</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Tell others what you think about this product..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            style={styles.reviewInput}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>
            {content.length}/500 characters
          </Text>
        </View>

        {/* Images Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add photos (optional)</Text>
          <Text style={styles.sectionDescription}>
            Help others by sharing photos of the product
          </Text>
          
          <View style={styles.imageGrid}>
            {/* Show selected images */}
            {imageUris.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.selectedImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
            
            {/* Show add image buttons for remaining slots */}
            {imageUris.length < 4 && (
              <TouchableOpacity
                onPress={handlePickImage}
                style={styles.addImageButton}
              >
                <Ionicons name="camera" size={32} color={colors.text.secondary} />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton, 
            (!rating || !content.trim() || submitting) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!rating || !content.trim() || submitting}
        >
          <Text style={[
            styles.submitButtonText,
            (!rating || !content.trim() || submitting) && styles.submitButtonTextDisabled
          ]}>
            {submitting ? "Posting Review..." : "Post Review"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 120, // Space for submit button
  },
  section: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  starButton: {
    padding: spacing.xs,
    marginHorizontal: 2,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 8,
    padding: spacing.md,
    minHeight: 120,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
  },
  characterCount: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.tertiary,
    textAlign: "right",
    marginTop: spacing.xs,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  imageWrapper: {
    position: "relative",
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border.primary,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.secondary,
  },
  addImageText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  submitContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: colors.text.tertiary,
  },
  submitButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
  },
  submitButtonTextDisabled: {
    color: colors.text.secondary,
  },
});