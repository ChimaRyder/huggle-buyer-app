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
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, radii } from '@/constants/theme';
import { useApi } from '@/context/ApiContext';
import { disablePushToken } from '@/utils/pushToken';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      await signOut();
      router.dismissAll();
      router.replace('/(login)');
    }
  };

  const profileMenuItems = [
    { id: 1, title: 'My Orders', subtitle: 'View your order history', icon: 'receipt-outline', screen: '/(screens)/order/Orders', iconBg: '#E8F5E9' },
    { id: 2, title: 'Favorites', subtitle: 'Saved stores & products', icon: 'heart-outline', screen: '/(screens)/profile/FavoritesScreen', iconBg: '#FCE4EC' },
    { id: 3, title: 'Settings', subtitle: 'App preferences', icon: 'settings-outline', screen: '/(screens)/profile/SettingsScreen', iconBg: '#E3F2FD' },
  ];

  const handleMenuItemPress = (screen: string) => {
    if (screen === '/(screens)/order/Orders' || screen === '/(screens)/profile/FavoritesScreen' || screen === '/(screens)/profile/SettingsScreen') {
      router.push(screen);
    } else {
      alert(`Navigating to ${screen} - This screen is not implemented yet`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header with Gradient */}
        <LinearGradient
          colors={[colors.primary.main, colors.primary.dark || '#3D7A1E']}
          style={styles.headerGradient}
        >
          <SafeAreaView edges={['top']} style={styles.safeHeader}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: user?.imageUrl }}
                  style={styles.avatar}
                />
                <View style={styles.avatarBadge}>
                  <Ionicons name="checkmark" size={12} color={colors.text.inverse} />
                </View>
              </View>
              <Text style={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.profileEmail}>{user?.emailAddresses[0].emailAddress}</Text>

              {/* Member Badge */}
              <View style={styles.memberBadge}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.memberBadgeText}>Huggle Member</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuContainer}>
            {profileMenuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index === profileMenuItems.length - 1 && styles.menuItemLast
                ]}
                onPress={() => handleMenuItemPress(item.screen)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon as any} size={22} color={colors.primary.main} />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.menuItemChevron}>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} style={{ marginRight: 8 }} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>Huggle v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  safeHeader: {
    width: '100%',
  },
  headerGradient: {
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background.primary,
    marginBottom: spacing.md,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'visible',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary.main,
  },
  profileName: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  profileEmail: {
    fontSize: typography.fontSizes.md,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: spacing.md,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  memberBadgeText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.inverse,
    fontWeight: typography.fontWeights.semibold,
    marginLeft: spacing.xs,
  },
  menuSection: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
    marginLeft: spacing.xs,
  },
  menuContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.tertiary,
  },
  menuItemChevron: {
    marginLeft: spacing.sm,
  },
  signOutSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  signOutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.danger + '30',
  },
  signOutText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.danger,
  },
  versionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

export default ProfileScreen;

