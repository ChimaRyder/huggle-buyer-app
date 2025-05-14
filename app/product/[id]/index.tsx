import React from 'react';
import { View, Image, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import ReviewCard from '../../../components/ReviewCard';
import { images } from '../../../assets';

// Mock product data - in a real app, this would come from an API
const mockProducts = {
  '1': {
    id: '1',
    name: 'Chocolate Cake',
    image: images.products.product1,
    rating: 4.8,
    discount: 25,
    distance: '5km',
    time: '45mins',
    availableItems: 5,
    description: 'A delicious chocolate cake made with the finest ingredients. Perfect for any celebration or special occasion.',
    price: 150,
    discountedPrice: 112.5,
  },
  '2': {
    id: '2',
    name: 'Fresh Salad',
    image: images.products.product2,
    rating: 4.6,
    discount: 15,
    distance: '3km',
    time: '30mins',
    availableItems: 8,
    description: 'A healthy and refreshing salad made with crisp vegetables and a light vinaigrette dressing.',
    price: 120,
    discountedPrice: 102,
  },
  '3': {
    id: '3',
    name: 'Fruit Smoothie',
    image: images.products.product3,
    rating: 4.9,
    discount: 20,
    distance: '4km',
    time: '35mins',
    availableItems: 3,
    description: 'A refreshing blend of seasonal fruits, perfect for a healthy breakfast or afternoon pick-me-up.',
    price: 90,
    discountedPrice: 72,
  },
  '4': {
    id: '4',
    name: 'Veggie Pizza',
    image: images.products.product4,
    rating: 4.7,
    discount: 10,
    distance: '6km',
    time: '40mins',
    availableItems: 6,
    description: 'A delicious vegetarian pizza topped with fresh vegetables and melted cheese.',
    price: 200,
    discountedPrice: 180,
  },
};

export default function ProductScreen() {
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = React.useState(1);
  
  const product = mockProducts[id as keyof typeof mockProducts];

  const handleQuantityChange = (increment: boolean) => {
    setQuantity(prev => {
      const newValue = increment ? prev + 1 : prev - 1;
      return Math.min(Math.max(newValue, 1), product.availableItems);
    });
  };

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Image
          source={product.image}
          style={styles.productImage}
          resizeMode="cover"
        />

        <View style={styles.contentContainer}>
          {/* Product Name & Quantity Selector */}
          <View style={styles.nameQuantityRow}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.quantitySelector}>
              <Pressable
                onPress={() => handleQuantityChange(false)}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </Pressable>
              <Text style={styles.quantityText}>{quantity}</Text>
              <Pressable
                onPress={() => handleQuantityChange(true)}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </Pressable>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.description}>{product.description}</Text>

          {/* Pricing Row */}
          <View style={styles.pricingRow}>
            <Text style={styles.discountedPrice}>₱{product.discountedPrice}</Text>
            <Text style={styles.originalPrice}>₱{product.price}</Text>
          </View>

          {/* Product Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <FontAwesome name="star" size={16} color="#FFD700" />
              <Text style={styles.detailText}>{product.rating} Rating</Text>
            </View>
            <View style={styles.detailRow}>
              <FontAwesome name="map-marker" size={16} color="#FF6B6B" />
              <Text style={styles.detailText}>{product.distance}</Text>
            </View>
            <View style={styles.detailRow}>
              <FontAwesome name="clock-o" size={16} color="#4CAF50" />
              <Text style={styles.detailText}>{product.time}</Text>
            </View>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <ReviewCard 
              reviewerName="John Doe"
              message="Great product! Would definitely order again."
              rating={5}
            />
            <ReviewCard 
              reviewerName="Jane Smith"
              message="Good quality and fast delivery."
              rating={4}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  productImage: {
    width: '100%',
    height: 300,
  },
  contentContainer: {
    padding: 16,
  },
  nameQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 24,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  discountedPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
  },
  reviewsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 20,
  },
});
