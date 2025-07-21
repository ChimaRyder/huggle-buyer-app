import React from "react";
import {
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  Text,
} from "react-native";

import { images, ImageSource } from "../assets";

interface Category {
  id: string;
  name: string;
  image: ImageSource;
}

const categories: Category[] = [
  { id: "Food", name: "Food", image: images.categories.food },
  {
    id: "Electronics",
    name: "Electronics",
    image: images.categories.electronics,
  },
  { id: "Clothing", name: "Clothing", image: images.categories.clothing },
  {
    id: "HomeAppliances",
    name: "Home Appliances",
    image: images.categories.homeAppliances,
  },
  { id: "Books", name: "Books", image: images.categories.books },
  {
    id: "HealthAndBeauty",
    name: "Health & Beauty",
    image: images.categories.healthAndBeauty,
  },
  {
    id: "SportsAndOutdoors",
    name: "Sports & Outdoors",
    image: images.categories.sports,
  },
  { id: "ToysAndGames", name: "Toys & Games", image: images.categories.toys },
  { id: "Pets", name: "Pets", image: images.categories.pets },
  // { id: "Automotive", name: "Automotive", image: images.categories.food },
  { id: "BabyProducts", name: "Baby Products", image: images.categories.baby },
  {
    id: "OfficeSupplies",
    name: "Office Supplies",
    image: images.categories.office,
  },
  { id: "ArtsAndCrafts", name: "Arts & Crafts", image: images.categories.arts },
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
          onPress={() => {
            /* Handle category selection */
          }}
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
    alignItems: "center",
    marginRight: 16,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#4E4545",
    overflow: "hidden",
    marginBottom: 4,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  categoryName: {
    fontSize: 12,
    color: "#333",
    marginTop: 4,
  },
});

export default CategoryCarousel;
