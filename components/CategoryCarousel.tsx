import React from 'react';
import { ScrollView, StyleSheet, Image, TouchableOpacity, View, Text } from 'react-native';

import { images, ImageSource } from '../assets';

interface Category {
  id: string;
  name: string;
  image: ImageSource;
}

const categories: Category[] = [
  { id: '1', name: 'Meals', image: images.categories.meals },
  { id: '2', name: 'Snacks', image: images.categories.snacks },
  { id: '3', name: 'Desserts', image: images.categories.desserts },
  { id: '4', name: 'Drinks', image: images.categories.drinks },
  { id: '5', name: 'Groceries', image: images.categories.groceries },
];

const CategoryCarousel = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={styles.categoryButton}
          onPress={() => {/* Handle category selection */}}
        >
          <View style={styles.imageContainer}>
            <Image source={category.image} style={styles.image} />
          </View>
          <Text style={styles.categoryName}>{category.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    alignItems: 'center',
    marginRight: 16,
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#4E4545',
    overflow: 'hidden',
    marginBottom: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryName: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
});

export default CategoryCarousel;
