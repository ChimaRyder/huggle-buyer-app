import React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import ProductGrid from "../../components/ProductGrid";

export default function TrendingProductsScreen() {
  const { productType } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Trending: {productType}</Text>
        <ProductGrid
          productType={
            typeof productType === "string" ? productType : undefined
          }
          showHeader={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", margin: 16, marginTop: 32 },
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F8FA", //F7F8FA
  },
});
