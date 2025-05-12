import React from 'react';
import { ScrollView, StyleSheet, View, SafeAreaView } from 'react-native';
import CategoryCarousel from '../../components/CategoryCarousel';
import PromoBanner from '../../components/PromoBanner';
import ProductGrid from '../../components/ProductGrid';
import GreeterSection from '../../components/GreeterSection';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <GreeterSection />
        <CategoryCarousel />
        <PromoBanner />
        <ProductGrid />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  container: {
    flex: 1,
  },
});
