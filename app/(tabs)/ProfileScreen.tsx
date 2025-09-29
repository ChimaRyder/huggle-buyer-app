import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { useApi } from '@/context/ApiContext';
import { disablePushToken } from '@/utils/pushToken';
import AsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Replace with API call to fetch user profile menu items

const ProfileScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();
  const { client: apiClient } = useApi();

  const handleSignOut = async () => {
    try {
      console.log('🚪 ProfileScreen: Starting logout process...');
      
      // Try to get stored push token ID and deactivate it
      const storedTokenId = await AsyncStorage.getItem('pushTokenId');
      if (storedTokenId) {
        console.log('📱 ProfileScreen: Deactivating push token on logout...');
        const response = await disablePushToken(apiClient, storedTokenId);
        if (response.success) {
          console.log('✅ ProfileScreen: Push token deactivated successfully');
        } else {
          console.error('❌ ProfileScreen: Failed to deactivate push token:', response.error);
        }
        // Clear stored token ID regardless of API result
        await AsyncStorage.removeItem('pushTokenId');
      }
    } catch (error) {
      console.error('❌ ProfileScreen: Error during logout process:', error);
    } finally {
      // Always sign out, even if push token deactivation fails
      console.log('🚪 ProfileScreen: Completing sign out...');
      signOut();
      router.replace('/');
    }
  };

  // TODO: Replace with API call to fetch user profile menu items
  const profileMenuItems = [
    { id: 1, title: 'My Orders', icon: 'receipt-outline', screen: '/(screens)/order/Orders' },
    { id: 2, title: 'Favorites', icon: 'heart-outline', screen: '/(screens)/profile/FavoritesScreen' },
    { id: 3, title: 'Settings', icon: 'settings-outline', screen: '/(screens)/profile/SettingsScreen' },
  ];

  const handleMenuItemPress = (screen: string) => {
    if (screen === '/(screens)/order/Orders' || screen === '/(screens)/profile/FavoritesScreen' || screen === '/(screens)/profile/SettingsScreen') {
      router.push(screen);
    } else {
      // For now, we'll just show an alert since these screens don't exist yet
      alert(`Navigating to ${screen} - This screen is not implemented in this prototype`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.imageUrl }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.profileName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.profileEmail}>{user?.emailAddresses[0].emailAddress}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {profileMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(item.screen)}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={24} color={colors.primary.main} />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background.tertiary,
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: colors.text.tertiary,
  },
  menuContainer: {
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 18,
    color: colors.text.primary,
    marginLeft: 16,
  },
  bottomContainer: {
    padding: 16,
    marginTop: 32,
  },
  signOutButton: {
    backgroundColor: colors.danger,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primaryInverted,
  },
});

export default ProfileScreen;
