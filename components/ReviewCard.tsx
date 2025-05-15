import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface ReviewCardProps {
  reviewerName: string;
  message: string;
  rating: number;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ reviewerName, message, rating }) => {
  return (
    <View style={styles.container}>
      <View style={styles.accentLine} />
      <View style={styles.content}>
        <Text style={styles.reviewerName}>{reviewerName}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        <View style={styles.ratingContainer}>
          <FontAwesome name="star" size={16} color="#FFD700" style={styles.star} />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accentLine: {
    width: 4,
    backgroundColor: '#104911',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
});

export default ReviewCard;
