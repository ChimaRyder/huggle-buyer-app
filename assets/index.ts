export const images = {
  categories: {
    food: require("./categories/food.jpg"),
    electronics: require("./categories/electronics.jpg"),
    clothing: require("./categories/clothing.jpg"),
    homeAppliances: require("./categories/homeAppliance.jpg"),
    books: require("./categories/books.png"),
    healthAndBeauty: require("./categories/healthAndBeauty.jpg"),
    sports: require("./categories/sports.jpg"),
    toys: require("./categories/toys.jpg"),
    pets: require("./categories/pets.jpg"),
    baby: require("./categories/baby.jpg"),
    office: require("./categories/office.jpg"),
    arts: require("./categories/arts.jpg"),
  },
  banners: {
    promo1: require("./banners/promo1.png"),
    promo2: require("./banners/promo2.png"),
    promo3: require("./banners/promo3.png"),
  },
  products: {
    product1: require("./products/product1.png"),
    product2: require("./products/product2.png"),
    product3: require("./products/product3.png"),
    product4: require("./products/product4.png"),
  },
} as const;

// Type for the images object
export type ImageAssets = typeof images;

// Helper type to get the image source type
import { ImageSourcePropType } from "react-native";

export type ImageSource = ImageSourcePropType;
