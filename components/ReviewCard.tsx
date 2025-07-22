import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { fontSizes, spacing, radii, shadows } from "../constants/theme";

interface ReviewCardProps {
  reviewerName: string;
  message: string;
  rating: number;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  reviewerName,
  message,
  rating,
}) => {
  return (
    <View
      style={styles.container}
      accessibilityLabel={`Review by ${reviewerName}`}
    >
      <View style={styles.accentLine} />
      <View style={styles.content}>
        <Text style={styles.reviewerName} accessibilityRole="text">
          {reviewerName}
        </Text>
        <Text style={styles.message} numberOfLines={2} accessibilityRole="text">
          {message}
        </Text>
        <View
          style={styles.ratingContainer}
          accessibilityRole="text"
          accessibilityLabel={`Rating: ${rating.toFixed(1)} out of 5`}
        >
          <FontAwesome
            name="star"
            size={16}
            color="#FFD700"
            style={styles.star}
            accessibilityLabel="Star icon"
          />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: radii.md,
    marginVertical: spacing.sm,
    ...shadows.card,
    minHeight: 80,
    alignItems: "stretch",
  },
  accentLine: {
    width: 4,
    backgroundColor: "#104911",
    borderTopLeftRadius: radii.md,
    borderBottomLeftRadius: radii.md,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
  },
  reviewerName: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    marginBottom: spacing.xs,
    color: "#222",
  },
  message: {
    fontSize: fontSizes.sm,
    color: "#444",
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  star: {
    marginRight: spacing.xs,
  },
  ratingText: {
    fontSize: fontSizes.sm,
    color: "#104911",
    fontWeight: "bold",
  },
});

export default ReviewCard;
