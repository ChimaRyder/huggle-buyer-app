import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";
import { colors, spacing } from "@/constants/theme";
import type { BackendProduct } from "@/types/BackendModels";
import FoodItemCard from "../food/FoodItemCard";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 20;
const GAP = 12;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (SCREEN_WIDTH - (HORIZONTAL_PADDING * 2) - GAP) / NUM_COLUMNS;

interface ProductGridProps {
  products: BackendProduct[];
  onProductPress: (productId: string) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductPress }) => {
  const renderItem = ({ item, index }: { item: BackendProduct; index: number }) => {
    const isLeftColumn = index % 2 === 0;
    
    return (
      <View 
        style={[
          styles.cardWrapper,
          { 
            width: CARD_WIDTH,
            marginRight: isLeftColumn ? GAP : 0,
          }
        ]}
      >
        <FoodItemCard 
          item={item} 
          onPress={() => onProductPress(item.id)}
          fullWidth
        />
      </View>
    );
  };

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={NUM_COLUMNS}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.lg,
  },
  cardWrapper: {
    marginBottom: spacing.md,
  },
});

export default ProductGrid;
