import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { colors, spacing, typography } from "@/constants/theme";
import { createReview, updateReview, getReviewByOrderItemId } from "@/utils/reviews";
import { uploadReviewImages, validateImage } from "@/utils/firebaseStorage";
import { inspectReviewResponse, testFirebaseStorageUrls } from "@/utils/debugReviewAPI";

export default function ReviewProductScreen() {
  const router = useRouter();
  const { 
    productId, 
    orderId, 
    storeId, 
    orderItemId,
    productName,
    isEdit,
    existingReviewId 
  } = useLocalSearchParams();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEditMode = isEdit === "true";
  const displayProductName = productName as string || "Product";

  useEffect(() => {
    if (isEditMode && orderItemId) {
      loadExistingReview();
    }
  }, [isEditMode, orderItemId]);

  const loadExistingReview = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await getReviewByOrderItemId(token, orderItemId as string);
      
      if (response?.data) {
        const review = response.data;
        setRating(review.Rating || 0);
        setContent(review.Content || "");
        // Handle image URLs if they exist - support both single ImageUrl and multiple ImageUrls
        if (review.ImageUrls && Array.isArray(review.ImageUrls)) {
          setImageUris(review.ImageUrls);
        } else if (review.ImageUrl) {
          setImageUris([review.ImageUrl]);
        } else {
          setImageUris([]);
        }
      }
    } catch (error) {
      console.error("Error loading existing review:", error);
      Alert.alert("Error", "Failed to load existing review");
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets) {
      const newUris = result.assets.map((asset) => asset.uri);
      
      // Validate images before adding them
      try {
        for (const uri of newUris) {
          await validateImage(uri, 5 * 1024 * 1024); // 5MB limit
        }
        
        // Add validated images
        setImageUris(prev => {
          const combined = [...prev, ...newUris];
          if (combined.length > 4) {
            Alert.alert("Image Limit", "You can only add up to 4 images per review.");
            return combined.slice(0, 4);
          }
          return combined;
        });
      } catch (error) {
        Alert.alert(
          "Invalid Image", 
          error instanceof Error 
            ? error.message 
            : "One or more selected images are invalid. Please choose different images."
        );
      }
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

    // Content is now optional - only rating is required

    setSubmitting(true);

    try {
      const token = await getToken();
      
      // Validate and upload images
      const uploadedImageUrls = [];
      if (imageUris.length > 0) {
        try {
          // Validate all images first
          for (const uri of imageUris) {
            await validateImage(uri, 5 * 1024 * 1024); // 5MB limit
          }
          
          // Upload all images to Firebase Storage
          const urls = await uploadReviewImages(imageUris);
          uploadedImageUrls.push(...urls);
          console.log(`Successfully uploaded ${uploadedImageUrls.length} images`);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          Alert.alert(
            "Upload Error", 
            uploadError instanceof Error 
              ? uploadError.message 
              : "Failed to upload one or more images. Please try again."
          );
          return;
        }
      }

      // Create review data
      const reviewData = {
        productId: productId as string,
        buyerId: user?.id || "",
        orderId: orderId as string,
        orderItemId: orderItemId as string || null,
        content: content,
        imageUrls: uploadedImageUrls,
        rating: rating,
      };
      
      console.log("Review data being sent:", {
        ...reviewData,
        imageUrls: `[${uploadedImageUrls.length} images]`
      });

      let result;
      if (isEditMode && existingReviewId) {
        // Update existing review
        console.log("Updating existing review with ID:", existingReviewId);
        result = await updateReview(token, existingReviewId as string, reviewData);
      } else {
        // Create new review
        console.log("Creating new review");
        result = await createReview(token, reviewData);
      }

      if (result.success !== false) {
        console.log("✅ Review creation/update succeeded!");
        
        // Test Firebase Storage URL accessibility
        if (uploadedImageUrls.length > 0) {
          await testFirebaseStorageUrls(uploadedImageUrls);
        }
        
        // Inspect the created review to see what was actually saved
        if (orderItemId) {
          setTimeout(async () => {
            try {
              const savedReview = await inspectReviewResponse(token, orderItemId as string);
              if (savedReview) {
                console.log("🔍 Review was saved with these image fields:");
                console.log("- ImageUrl:", savedReview.ImageUrl);
                console.log("- ImageUrls:", savedReview.ImageUrls);
              }
            } catch (inspectError) {
              console.log("Could not inspect saved review:", inspectError);
            }
          }, 1000); // Wait 1 second for database to update
        }
        
        Alert.alert(
          "Success", 
          isEditMode 
            ? "Your review has been updated!" 
            : "Your review has been posted! Pull down to refresh the order details to see the updated status."
        );
        router.back();
      } else {
        throw new Error("Failed to save review");
      }
    } catch (error) {
      console.error("Failed to save review:", error);
      Alert.alert("Error", "Failed to save review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Loading Review...</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading review data...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>
            {isEditMode ? "Edit Review" : "Write Review"}
          </Text>
          <Text style={styles.headerSubtitle}>{displayProductName}</Text>
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
          <Text style={styles.sectionTitle}>Share your experience (optional)</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Tell others what you think about this product (optional)..."
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
            (!rating || submitting) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!rating || submitting}
        >
          <Text style={[
            styles.submitButtonText,
            (!rating || submitting) && styles.submitButtonTextDisabled
          ]}>
            {submitting ? 
              (isEditMode ? "Updating Review..." : "Posting Review...") : 
              (isEditMode ? "Update Review" : "Post Review")
            }
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
    backgroundColor: colors.success,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
  },
});