import React, { useState } from 'react';
import { View, Image, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import ReviewCard from '../../components/ReviewCard';
import { mockProducts } from '../../components/ProductGrid';
import { TouchableOpacity } from 'react-native';

export default function ProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  
  const product = mockProducts.find((p) => p.id === id?.toString());

  const handleQuantityChange = (increment: boolean) => {
    setQuantity(prev => {
      const newValue = increment ? prev + 1 : prev - 1;
      return Math.min(Math.max(newValue, 1), 5);
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.imageContainer}>
          <Image
            source={product?.image}
            style={styles.productImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {/* Product Name & Quantity Selector */}
          <View style={styles.nameQuantityRow}>
            <Text style={styles.productName}>{product?.name}</Text>
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

          {/* Pricing Row */}
          <View style={styles.pricingRow}>
            <Text style={styles.discountedPrice}>₱{product?.price || 100}</Text>
            <Text style={styles.originalPrice}>₱{product ? (product.price * (1 + product.discount/100)).toFixed(0) : 150}</Text>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.horizontalRule} />
            <Text numberOfLines={2} style={styles.description}>
              This is a sample product description that might be longer than 50 characters...
            </Text>
          </View>

          {/* Store Info Row */}
          <View style={styles.storeInfoRow}>
            <View style={styles.storeSection}>
              <FontAwesome name="shopping-bag" size={20} color="#548C2F" />
              <Text style={styles.storeName}>Store Name</Text>
            </View>
            <View style={styles.locationSection}>
              <FontAwesome name="map-marker" size={20} color="#548C2F" />
              <Text style={styles.location}>Store Location</Text>
            </View>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <Pressable>
                <Text style={styles.seeAllButton}>See all</Text>
              </Pressable>
            </View>
            <ReviewCard
              reviewerName="John Doe"
              message="Great product! Highly recommended."
              rating={4}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomButtons}>
        <Pressable 
          style={styles.actionButton}
          onPress={() => router.push('/(screens)/chat')}
        >
          <FontAwesome name="comment" size={25} color="#fff" />
        </Pressable>
        <Pressable 
          style={styles.actionButton}
          onPress={() => router.push('/(screens)/cart')}
        >
          <FontAwesome name="shopping-cart" size={25} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '50%',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  nameQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productName: {
    fontSize: 25,
    fontFamily: 'Poppins-Bold',
    flex: 1,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  quantityButtonText: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  quantityText: {
    marginHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  discountedPrice: {
    fontFamily: 'Poppins-Regular',
    fontSize: 20,
    color: '#F9A620',
    marginRight: 8,
  },
  originalPrice: {
    fontFamily: 'Poppins-Regular',
    fontSize: 20,
    color: '#979797',
    textDecorationLine: 'line-through',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#454B60',
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    marginBottom: 8,
  },
  horizontalRule: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  storeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  storeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
    color: '#868889',
  },
  location: {
    fontSize: 16,
    color: '#868889',
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
  },
  reviewsSection: {
    marginBottom: 100, // Extra space for bottom buttons
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    color: '#454B60',
  },
  seeAllButton: {
    color: '#104911',
    fontSize: 16,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#F9A620',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
