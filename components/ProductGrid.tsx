import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
    discount: 10,
    distance: '6km',
    time: '40mins',
    availableItems: 6,
  },
];

const getStyles = (cardWidth: number) =>
  StyleSheet.create({
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
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    viewAllText: {
      fontSize: 14,
      color: '#666',
      marginRight: 4,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    card: {
      width: cardWidth,
      marginBottom: 16,
      backgroundColor: '#fff',
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    imageContainer: {
      position: 'relative',
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      overflow: 'hidden',
    },
    image: {
      width: cardWidth,
      height: cardWidth,
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
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    distanceContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderTopRightRadius: 10,
    },
    distanceText: {
      color: '#fff',
      fontSize: 12,
    },
    infoContainer: {
      padding: 12,
    },
    productName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 4,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    ratingText: {
      marginLeft: 4,
      fontSize: 14,
      color: '#666',
    },
    availableText: {
      fontSize: 12,
      color: '#999',
    },
  });

const ProductGrid = () => {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const cardMargin = 16;
  const cardWidth = (screenWidth - cardMargin * 3) / 2; // 2 cards + margin in between + outer padding
  const styles = getStyles(cardWidth);

  const renderProduct = (product: Product) => (
    <TouchableOpacity
      key={product.id}
      style={styles.card}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } } as any)}
    >
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
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{product.name}</Text>
        <View style={styles.ratingContainer}>
          <MaterialIcons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{product.rating}</Text>
        </View>
        <Text style={styles.availableText}>
          {product.availableItems} items available
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Popular Items</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>{mockProducts.map(renderProduct)}</View>
    </View>
  );
};

export default ProductGrid;
