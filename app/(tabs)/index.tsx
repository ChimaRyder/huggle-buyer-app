import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, SafeAreaView, Modal, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import CategoryCarousel from '../../components/CategoryCarousel';
import PromoBanner from '../../components/PromoBanner';
import ProductGrid from '../../components/ProductGrid';
import GreeterSection from '../../components/GreeterSection';

export default function HomeScreen() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkLocation = async () => {
      // You can replace this with a backend check if needed
      const location = await AsyncStorage.getItem('userLocation');
      if (!location) {
        setShowModal(true);
      }
    };
    checkLocation();
  }, []);

  const handleModalConfirm = () => {
    setShowModal(false);
    router.push('/screens/MapsScreen');
  };

  const handleLocationPress = () => {
    router.push('/screens/MapsScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Modal visible={showModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 28, alignItems: 'center', width: 320 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Pin point your location to get started</Text>
            <TouchableOpacity style={{ backgroundColor: '#0d2329', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 40, marginTop: 16 }} onPress={handleModalConfirm}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Pin Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <GreeterSection onLocationPress={handleLocationPress} />
        <CategoryCarousel />
        <PromoBanner />
        <View style={styles.productsContainer}>
          <ProductGrid />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA', //F7F8FA
  },
  container: {
    flex: 1,
  },
  productsContainer: {
    marginHorizontal: 12,
  },
});
