import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Text } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import ReviewCard from '../../components/ReviewCard';
import { mockProducts } from '../../components/ProductGrid';
import { TouchableOpacity } from 'react-native';
import { fetchProductById, fetchStoreById } from '../../utils/api';
import { BackendProduct, BackendStore, BackendReview } from '../../types/BackendModels';
import { calculateDiscountPercentage, formatPrice, formatDate } from '../../utils/product';

export default function ProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<BackendProduct | null>(null);
  const [store, setStore] = useState<BackendStore | null>(null);
  
  // Fallback to mock product if needed
  const mockProduct = mockProducts.find((p) => p.id === id?.toString());

  useEffect(() => {
    const loadProductData = async () => {
      if (!id) {
        setError('Product ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const productData = await fetchProductById(id.toString());
        setProduct(productData);

        // Once we have the product, fetch the store data
        if (productData.storeId) {
          const storeData = await fetchStoreById(productData.storeId);
          setStore(storeData);
        }
      } catch (err) {
        console.error('Error loading product data:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [id]);

  const handleQuantityChange = (increment: boolean) => {
    setQuantity(prev => {
      const newValue = increment ? prev + 1 : prev - 1;
      return Math.min(Math.max(newValue, 1), product?.stock || 5);
    });
  };
  
  const navigateToStore = () => {
    if (store) {
      // Navigate to home screen with store ID, we can create a proper StoreScreen later
      router.push({
        pathname: '/(tabs)',
        params: { storeId: store.id }
      });
    }
  };
  
  const handleAddToCart = () => {
    // This will be implemented once the cart system is ready
    Alert.alert(
      "Add to Cart",
      `Added ${quantity} ${product?.name || 'item(s)'} to your cart`,
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F9A620" />
          <Text style={styles.loadingText}>Loading product details...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollView}>
            <View style={styles.imageContainer}>
              <Image
                source={
                  product?.coverImage 
                    ? { uri: product.coverImage } 
                    : mockProduct?.image || require('../../assets/products/product1.png')
                }
                style={styles.productImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => router.back()}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              
              {product && product.originalPrice > product.discountedPrice && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {calculateDiscountPercentage(product.originalPrice, product.discountedPrice)}% OFF
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.contentContainer}>
              {/* Product Name & Quantity Selector */}
              <View style={styles.nameQuantityRow}>
                <Text style={styles.productName}>{product?.name || mockProduct?.name}</Text>
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
                <Text style={styles.discountedPrice}>
                  {formatPrice(product?.discountedPrice || (mockProduct?.price || 100))}
                </Text>
                <Text style={styles.originalPrice}>
                  {formatPrice(product?.originalPrice || (mockProduct ? (mockProduct.price * (1 + mockProduct.discount/100)) : 150))}
                </Text>
              </View>

              {/* Description Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <View style={styles.horizontalRule} />
                <Text style={styles.description}>
                  {product?.description || "This is a sample product description that might be longer than 50 characters..."}
                </Text>
              </View>

              {/* Store Info Row */}
              <TouchableOpacity 
                style={styles.storeInfoRow} 
                onPress={navigateToStore}
                disabled={!store}
              >
                <View style={styles.storeSection}>
                  <FontAwesome name="shopping-bag" size={20} color="#548C2F" />
                  <Text style={styles.storeName}>{store?.name || "Store Name"}</Text>
                </View>
                <View style={styles.locationSection}>
                  <FontAwesome name="map-marker" size={20} color="#548C2F" />
                  <Text style={styles.location}>
                    {store ? `${store.city}, ${store.province}` : "Store Location"}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Stock and Expiry Info */}
              <View style={styles.additionalInfoSection}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Available:</Text>
                  <Text style={styles.infoValue}>{product?.stock || mockProduct?.availableItems || 0} items</Text>
                </View>
                {product?.expirationDate && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Expires:</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(product.expirationDate)}
                    </Text>
                  </View>
                )}
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
                  rating={product?.rating || 4}
                />
              </View>
            </View>
          </ScrollView>

          {/* Bottom Action Buttons */}
          <View style={styles.bottomButtons}>
            <Pressable 
              style={styles.chatButton}
              onPress={() => router.push('/(screens)/chat')}
            >
              <FontAwesome name="comment" size={25} color="#fff" />
            </Pressable>
            
            <Pressable 
              style={styles.addToCartButton}
              onPress={handleAddToCart}
            >
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </Pressable>
            
            <Pressable 
              style={styles.cartButton}
              onPress={() => router.push('/(screens)/cart')}
            >
              <FontAwesome name="shopping-cart" size={25} color="#fff" />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#F9A620',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
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
  discountBadge: {
    position: 'absolute',
    top: 20,
    right: 16,
    backgroundColor: '#FF6B6B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  discountText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
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
  additionalInfoSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
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
    alignItems: 'center',
  },
  chatButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#548C2F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cartButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#548C2F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  addToCartButton: {
    flex: 1,
    height: 60,
    backgroundColor: '#F9A620',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
});
