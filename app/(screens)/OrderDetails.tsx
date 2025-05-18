import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, Select, SelectItem, IndexPath, Button } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import PageTitle from '@/components/PageTitle';

const mockItems = [
  {
    id: 1,
    name: 'Lorem Ipsum',
    details: 'specific details',
    price: 120,
    image: require('../../assets/images/sample-store.jpg'),
    quantity: 1,
  },
  {
    id: 2,
    name: 'Lorem Ipsum',
    details: 'specific details',
    price: 120,
    image: require('../../assets/images/sample-store.jpg'),
    quantity: 1,
  },
];

const availablePickupTimes = ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM'];

const OrderDetails = () => {
  const [items, setItems] = useState(mockItems);
  const [selectedIndex, setSelectedIndex] = useState<IndexPath | undefined>(undefined);

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const confirmRemoveItem = (id: number) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeItem(id) },
    ]);
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const pickupTime = selectedIndex ? availablePickupTimes[selectedIndex.row] : '';

  return (
    <>
      <PageTitle title="Order Details" />
      <ScrollView contentContainerStyle={styles.container}>

        {/* Order Items */}
        <View style={styles.card}>
          {items.map((item) => (
            <View key={item.id} style={styles.itemContainer}>
              <Image source={item.image} style={styles.image} />
              <View style={styles.details}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text category="c1">{item.details}</Text>
                <Text style={styles.price}>₱{item.price}</Text>
              </View>
              <View style={styles.actions}>
              <TouchableOpacity onPress={() => confirmRemoveItem(item.id)}>
                  <Ionicons name="close" size={18} color="#051D24" style={{ marginTop: 4 }} />
                </TouchableOpacity>
                <View style={styles.qtyRow}>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, -1)}>
                    <Ionicons name="remove-circle-outline" size={20} color="#051D24" />
                  </TouchableOpacity>
                  <Text>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, 1)}>
                    <Ionicons name="add-circle-outline" size={20} color="#051D24" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          <View style={{ borderBottomColor: '#ccc', borderBottomWidth: 1, marginVertical: 12 }} />
        </View>

        {/* Total */}
        <Text style={styles.total}>TOTAL: ₱{total.toFixed(2)}</Text>

        {/* Pickup Info */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>PICK-UP AT</Text>
            <View style={styles.pickupBox}>
              <Ionicons name="storefront" size={18} color="#051D24" style={{ marginRight: 6 }} />
              <Text>Fresh Baking Co.</Text>
            </View>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>CHOOSE TIME</Text>
            <Select
              selectedIndex={selectedIndex}
              onSelect={(index) => setSelectedIndex(index as IndexPath)}
              value={pickupTime || 'Choose time'}
              style={styles.input}
            >
              {availablePickupTimes.map((time) => (
                <SelectItem key={time} title={time} />
              ))}
            </Select>
          </View>
        </View>

        {/* Address */}
        <View style={styles.addressCard}>
          <Image
            source={require('../../assets/images/map-icon.png')} // Add your box icon here
            style={styles.boxImage}
          />
          <View>
            <Text category="s1" style={styles.addressText}>Fresh Baking Company Crossroads</Text>
            <Text category="c1" style={styles.addressText}>Crossroads, Banilad Rd, Lungsod ng Cebu</Text>
          </View>
        </View>

        {/* Confirm Button */}
        <Button style={styles.confirmButton}>
          Confirm Order
        </Button>
      </ScrollView>
    </>
  );
};

export default OrderDetails;


const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingBottom: 24,
      backgroundColor: '#F5F5F5',
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    itemContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      alignItems: 'center',
    },
    image: {
      width: 56,
      height: 56,
      borderRadius: 12,
      marginRight: 12,
    },
    details: {
      flex: 1,
      fontFamily: 'Poppins-Regular',
      color: '#868889',
    },
    itemName: {
      fontFamily: 'Poppins-SemiBold',
      color: '#051D24',
      fontSize: 16,
    },
    price: {
      marginTop: 4,
      fontFamily: 'Poppins-SemiBold',
    },
    actions: {
      alignItems: 'center',
      gap: 4,
    },
    qtyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    total: {
      fontFamily: 'Poppins-Bold',
      fontSize: 16,
      marginBottom: 16,
      color: '#051D24',
    },
    row: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    column: {
      flex: 1,
    },
    label: {
      fontWeight: 'bold',
      color: '#F9A620',
      marginBottom: 4,
    },
    pickupBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    input: {
      borderRadius: 12,
    },
    addressCard: {
      backgroundColor: '#fff',
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderRadius: 12,
      padding: 12,
      borderColor: '#E0E0E0',
      borderWidth: 1,
      marginBottom: 24,
    },
    boxImage: {
      width: 40,
      height: 40,
      marginRight: 8,
      marginTop: 2,
    },
    addressText: {
      fontWeight: 'bold',
      color: '#051D24',
    },
    confirmButton: {
      borderRadius: 30,
      backgroundColor: '#F9A620',
      borderColor: '#F9A620',
    },
  });
  