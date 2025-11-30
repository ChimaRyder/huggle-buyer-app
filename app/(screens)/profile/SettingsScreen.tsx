import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/constants/theme';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { ContentModal } from '@/components/common';

// Import markdown content
import privacyPolicyContent from '../../../about/privacy-policy';
import termsOfServiceContent from '../../../about/terms-of-service';
import aboutHuggleContent from '../../../about/about-huggle';

const SettingsScreen = () => {
  const router = useRouter();
  const { preferences: pushNotificationPrefs, updatePreferences: updatePushNotifications } = usePushNotifications();
  const [locationEnabled, setLocationEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  
  // Modal state
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalTitle, setModalTitle] = React.useState('');
  const [modalContent, setModalContent] = React.useState('');

  const handleBackPress = () => {
    router.back();
  };

  const handlePushNotificationToggle = async (enabled: boolean) => {
    try {
      await updatePushNotifications(enabled);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to update push notification preferences. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const openModal = (title: string, content: string) => {
    setModalTitle(title);
    setModalContent(content);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const settingsItems = [
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Receive order updates and promotions',
      type: 'toggle',
      value: pushNotificationPrefs.isEnabled,
      onToggle: handlePushNotificationToggle,
      icon: 'notifications-outline',
      isLoading: pushNotificationPrefs.isLoading,
    },
    {
      id: 'location',
      title: 'Location Services',
      subtitle: 'Find nearby stores and delivery options',
      type: 'toggle',
      value: locationEnabled,
      onToggle: setLocationEnabled,
      icon: 'location-outline',
    },
    {
      id: 'darkmode',
      title: 'Dark Mode',
      subtitle: 'Use dark theme throughout the app',
      type: 'toggle',
      value: darkModeEnabled,
      onToggle: setDarkModeEnabled,
      icon: 'moon-outline',
    },
  ];

  const aboutItems = [
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: 'shield-outline',
      onPress: () => openModal('Privacy Policy', privacyPolicyContent),
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: 'document-text-outline',
      onPress: () => openModal('Terms of Service', termsOfServiceContent),
    },
    {
      id: 'about',
      title: 'About Huggle',
      icon: 'information-circle-outline',
      onPress: () => openModal('About Huggle', aboutHuggleContent),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {settingsItems.map((item) => (
            <View key={item.id} style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon as any} size={20} color={colors.primary.main} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                disabled={item.isLoading || false}
                trackColor={{
                  false: colors.border.secondary,
                  true: colors.primary.main,
                }}
                thumbColor={colors.background.primary}
                style={{
                  opacity: (item.isLoading || false) ? 0.6 : 1,
                }}
              />
            </View>
          ))}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          {aboutItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.settingItem}
              onPress={item.onPress}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon as any} size={20} color={colors.primary.main} />
                </View>
                <Text style={styles.settingTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Huggle Buyer App v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Content Modal */}
      <ContentModal
        visible={modalVisible}
        title={modalTitle}
        content={modalContent}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPlaceholder: {
    width: 24, // Same width as icons for centering
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeights.tight * typography.fontSizes.sm,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  versionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.tertiary,
  },
});

export default SettingsScreen;