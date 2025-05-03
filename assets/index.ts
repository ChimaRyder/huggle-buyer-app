export const images = {
  categories: {
    meals: require('./categories/meals.png'),
    snacks: require('./categories/snacks.png'),
    desserts: require('./categories/desserts.png'),
    drinks: require('./categories/drinks.png'),
    groceries: require('./categories/groceries.png'),
  },
  banners: {
    promo1: require('./banners/promo1.png'),
    promo2: require('./banners/promo2.png'),
    promo3: require('./banners/promo3.png'),
  },
  products: {
    product1: require('./products/product1.png'),
    product2: require('./products/product2.png'),
    product3: require('./products/product3.png'),
    product4: require('./products/product4.png'),
  },
} as const;

// Type for the images object
export type ImageAssets = typeof images;

// Helper type to get the image source type
import { ImageSourcePropType } from 'react-native';

export type ImageSource = ImageSourcePropType;
