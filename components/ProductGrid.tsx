import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { images, ImageSource } from '../assets';

interface Product {
  id: string;
  name: string;
  image: ImageSource;
  rating: number;
  discount: number;
  distance: string;
  time: string;
  availableItems: number;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Chocolate Cake',
    image: images.products.product1,
    rating: 4.8,
    discount: 25,
    distance: '5km',
    time: '45mins',
    availableItems: 5,
  },
  {
    id: '2',
    name: 'Fresh Salad',
    image: images.products.product2,
    rating: 4.6,
    discount: 15,
    distance: '3km',
    time: '30mins',
    availableItems: 8,
  },
  {
    id: '3',
    name: 'Fruit Smoothie',
    image: images.products.product3,
    rating: 4.9,
    discount: 20,
    distance: '4km',
    time: '35mins',
    availableItems: 3,
  },
  {
    id: '4',
    name: 'Veggie Pizza',
    image: images.products.product4,
    rating: 4.7,
    discount: 30,
    distance: '6km',
    time: '50mins',
    availableItems: 2,
  },
];

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 48 = padding (16) * 2 + gap (16)

const ProductGrid = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Featured Deals</Text>
        <TouchableOpacity onPress={() => {/* Handle see all */}}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        {mockProducts.map((product) => (
          <TouchableOpacity key={product.id} style={styles.card}>
            <View style={styles.imageContainer}>
              <Image source={product.image} style={styles.image} />
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{product.discount}% OFF</Text>
              </View>
              <View style={styles.distanceContainer}>
                <Text style={styles.distanceText}>
                  {product.distance} - {product.time}
                </Text>
              </View>
            </View>
            <View style={styles.details}>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>{product.rating}</Text>
              </View>
              <Text style={styles.items}>
                {product.availableItems} items
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#548C2F',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(217, 217, 217, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  distanceContainer: {
    position: 'absolute',
  bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 10,
  },
  distanceText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  details: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  items: {
    fontSize: 12,
    color: '#999',
  },
});

export default ProductGrid;
