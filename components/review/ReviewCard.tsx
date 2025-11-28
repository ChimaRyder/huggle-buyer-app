import React, { useState } from "react";
import { View, StyleSheet, Text, Image, TouchableOpacity, ScrollView, Modal, Dimensions } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { fontSizes, spacing, radii, shadows, colors } from "../../constants/theme";

interface ReviewCardProps {
  reviewerName?: string;
  buyerId?: string;
  message?: string;
  rating: number;
  imageUrls?: string[];
  createdAt?: string;
  showExpandButton?: boolean;
  isCompact?: boolean;
  productName?: string;
  highlightMedia?: boolean; // Whether to highlight media presence when filtering
}

const { width } = Dimensions.get('window');

export const ReviewCard: React.FC<ReviewCardProps> = ({
  reviewerName,
  buyerId,
  message,
  rating,
  imageUrls = [],
  createdAt,
  showExpandButton = false,
  isCompact = false,
  productName,
  highlightMedia = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  // Display name logic
  const displayName = reviewerName || (buyerId ? `User ${buyerId.slice(-4)}` : 'Anonymous');
  
  // Message handling
  const hasMessage = message && message.trim().length > 0;
  const shouldShowExpanded = expanded || !showExpandButton;
  const messageToShow = shouldShowExpanded ? message : message?.slice(0, 100) + (message && message.length > 100 ? '...' : '');

  return (
    <>
      <View
        style={[styles.container, isCompact && styles.compactContainer]}
        accessibilityLabel={`Review by ${displayName}`}
      >
        <View style={styles.accentLine} />
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <Text style={styles.reviewerName} accessibilityRole="text">
                {displayName}
              </Text>
              {createdAt && (
                <Text style={styles.dateText}>
                  {formatDate(createdAt)}
                </Text>
              )}
            </View>
            
            {/* Rating and Media Indicator */}
            <View style={styles.ratingSection}>
              {highlightMedia && imageUrls.length > 0 && (
                <View style={styles.mediaIndicator}>
                  <Ionicons name="camera" size={14} color={colors.primary.main} />
                  <Text style={styles.mediaIndicatorText}>{imageUrls.length}</Text>
                </View>
              )}
              <View
                style={styles.ratingContainer}
                accessibilityRole="text"
                accessibilityLabel={`Rating: ${rating} out of 5`}
              >
                <FontAwesome
                  name="star"
                  size={16}
                  color={colors.warning}
                  style={styles.star}
                  accessibilityLabel="Star icon"
                />
                <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
              </View>
            </View>
          </View>

          {/* Product name (for store reviews) */}
          {productName && (
            <View style={styles.productNameContainer}>
              <Ionicons name="bag-check-outline" size={16} color={colors.primaryDark} style={styles.productIcon} />
              <Text style={styles.productNameText}>{productName}</Text>
            </View>
          )}

          {/* Message */}
          {hasMessage && (
            <View style={styles.messageContainer}>
              <Text 
                style={styles.message} 
                numberOfLines={shouldShowExpanded ? undefined : 3}
                accessibilityRole="text"
              >
                {messageToShow}
              </Text>
              {showExpandButton && message && message.length > 100 && (
                <TouchableOpacity 
                  onPress={() => setExpanded(!expanded)}
                  style={styles.expandButton}
                >
                  <Text style={styles.expandButtonText}>
                    {expanded ? 'Show less' : 'Read more'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Images */}
          {imageUrls.length > 0 && (
            <View style={styles.imagesContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imagesScrollContent}
              >
                {imageUrls.map((imageUrl, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedImageIndex(index)}
                    style={styles.imageContainer}
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.reviewImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {imageUrls.length > 3 && (
                <Text style={styles.moreImagesText}>
                  +{imageUrls.length - 3} more photos
                </Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Image Modal */}
      <Modal
        visible={selectedImageIndex !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImageIndex(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalCloseArea}
            onPress={() => setSelectedImageIndex(null)}
          >
            <View style={styles.modalContainer}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedImageIndex(null)}
              >
                <Ionicons name="close" size={24} color={colors.text.inverse} />
              </TouchableOpacity>
              
              {selectedImageIndex !== null && (
                <ScrollView 
                  horizontal 
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  contentOffset={{ x: selectedImageIndex * width, y: 0 }}
                >
                  {imageUrls.map((imageUrl, index) => (
                    <View key={index} style={styles.modalImageContainer}>
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.modalImage}
                        resizeMode="contain"
                      />
                    </View>
                  ))}
                </ScrollView>
              )}
              
              <Text style={styles.imageCounter}>
                {selectedImageIndex !== null ? `${selectedImageIndex + 1} of ${imageUrls.length}` : ''}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.background.primary,
    borderRadius: radii.md,
    marginVertical: spacing.sm,
    minHeight: 80,
    alignItems: "stretch",
  },
  compactContainer: {
    marginVertical: spacing.xs,
    minHeight: 60,
  },
  accentLine: {
    width: 4,
    backgroundColor: colors.primary.main,
    borderTopLeftRadius: radii.md,
    borderBottomLeftRadius: radii.md,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  userInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  dateText: {
    fontSize: fontSizes.xs,
    color: colors.text.secondary,
  },
  ratingSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    marginRight: spacing.xs,
  },
  ratingText: {
    fontSize: fontSizes.sm,
    color: colors.primary.main,
    fontWeight: "bold",
  },
  mediaIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary.main + '15',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  mediaIndicatorText: {
    fontSize: fontSizes.xs,
    color: colors.primary.main,
    fontWeight: "600",
  },
  productNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  productIcon: {
    marginRight: spacing.xs,
  },
  productNameText: {
    fontSize: fontSizes.sm,
    color: colors.primaryDark,
    fontWeight: "500",
  },
  messageContainer: {
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  expandButton: {
    marginTop: spacing.xs,
    alignSelf: "flex-start",
  },
  expandButtonText: {
    fontSize: fontSizes.sm,
    color: colors.primary.main,
    fontWeight: "600",
  },
  imagesContainer: {
    marginTop: spacing.sm,
  },
  imagesScrollContent: {
    paddingRight: spacing.sm,
  },
  imageContainer: {
    marginRight: spacing.sm,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: radii.sm,
  },
  moreImagesText: {
    fontSize: fontSizes.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseArea: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  modalImageContainer: {
    width: width,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: width - 40,
    height: "70%",
  },
  imageCounter: {
    position: "absolute",
    bottom: 50,
    color: colors.text.inverse,
    fontSize: fontSizes.md,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
});

export default ReviewCard;
