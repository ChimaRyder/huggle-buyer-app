import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
} from "react-native";
import { colors } from "@/constants/theme";
import type { BackendProduct } from "@/types/BackendModels";


import FoodItemCard from "../food/FoodItemCard";

interface ProductGridProps {
  products: BackendProduct[];
  onProductPress: (productId: string) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductPress }) => {

  return (
    <>  
      <FlatList
      
        data={products}
        renderItem={({item}) => (
          <View key={item.id}>
            <FoodItemCard 
              item={item} 
              onPress={() => onProductPress(item.id)} 
            />
          </View>
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        scrollEnabled={false}
      />
    </>
  )
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
  },
});

export default ProductGrid;