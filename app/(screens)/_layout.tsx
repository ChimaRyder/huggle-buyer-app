import { Stack } from 'expo-router';
import React from 'react';

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      {/* Cart screens */}
      <Stack.Screen name="cart/CartScreen" />
      <Stack.Screen name="cart/OrderConfirmationScreen" />
      <Stack.Screen name="cart/OrderReviewScreen" />
      
      {/* Chat screens */}
      <Stack.Screen name="chat/[id]" />
      
      {/* Home screens */}
      <Stack.Screen name="home/CategoryScreen" />
      <Stack.Screen name="home/MapsScreen" options={{ presentation: 'modal' }} />
      <Stack.Screen name="home/NotificationScreen" />
      <Stack.Screen name="home/TrendingProductsScreen" />
      
      {/* Order screens */}
      <Stack.Screen name="order/OrderDetails" />
      <Stack.Screen name="order/OrderItemsReviewScreen" />
      <Stack.Screen name="order/Orders" />
      <Stack.Screen name="order/ReviewProductScreen" />
      
      {/* Profile screens */}
      <Stack.Screen name="profile/FavoritesScreen" />
      <Stack.Screen name="profile/SettingsScreen" />
      
      {/* Search screens */}
      <Stack.Screen name="search/SearchResultsScreen" />
      <Stack.Screen name="search/SearchScreen" />
      
      {/* Store screens */}
      <Stack.Screen name="store/PostScreen" />
      <Stack.Screen name="store/ProductScreen" />
      <Stack.Screen name="store/ReviewsScreen" />
      <Stack.Screen name="store/StoreHomepageScreen" />
    </Stack>
  );
}

