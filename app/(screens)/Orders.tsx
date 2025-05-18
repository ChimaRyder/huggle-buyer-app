import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import PageTitle from '../../components/PageTitle';
import OrderCard from '../../components/OrderCard';

const tabs = ['Active', 'Completed', 'Cancelled'] as const;

const mockOrders = [
  {
    id: '1',
    date: 'Today, 8:20 AM',
    productName: 'Choco Chip Cookies',
    price: '₱99.00',
    description: 'Delicious choco chip cook...',
    storeName: 'Baked Bliss',
    location: 'IT Park',
    status: 'Active',
    image: require('../../assets/images/sample-store.jpg'),
  },
  {
    id: '2',
    date: 'Yesterday, 3:45 PM',
    productName: 'Beef Burger',
    price: '₱129.00',
    description: 'Juicy homemade beef...',
    storeName: 'Snack Shack',
    location: 'Ayala Center',
    status: 'Completed',
    image: require('../../assets/images/sample-store.jpg'),
  },
  {
    id: '3',
    date: 'March 1, 2025',
    productName: 'Veggie Sandwich',
    price: '₱89.00',
    description: 'Healthy and fresh with...',
    storeName: 'Green Eats',
    location: 'SM City Cebu',
    status: 'Cancelled',
    image: require('../../assets/images/sample-store.jpg'),
  },
] as const;

const Orders = () => {
  const [selectedTab, setSelectedTab] = useState<'Active' | 'Completed' | 'Cancelled'>('Active');

  const filtered = mockOrders.filter(order => order.status === selectedTab);

  return (
    <Layout style={styles.container}>
      <PageTitle title="Orders" />

      <View style={styles.tabs}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[
              styles.tab,
              selectedTab === tab && styles.activeTab
            ]}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filtered.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
      </ScrollView>
    </Layout>
  );
};

export default Orders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 27,
  },
  tab: {
    borderBottomWidth: 2,
    borderBottomColor: '#104911',
    paddingBottom: 6,
  },
  activeTab: {
    borderBottomColor: '#F9A620',
  },
  tabText: {
    color: '#104911',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#F9A620',
  },
  scrollContainer: {
    paddingBottom: 120,
  },
});
