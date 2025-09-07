/**
 * Settings screen menu items configuration
 * Used for the settings screen navigation options
 */

export interface SettingsItem {
  title: string;
  iconName?: string;
  iconColor?: string;
  iconLibrary?: 'MaterialIcons' | 'Ionicons' | 'Feather';
  onPress?: () => void;
  rightText?: string;
  textColor?: string;
  route?: string;
  hasToggle?: boolean;
  action?: string;
}

// Settings menu items configuration
// Note: This exports the structure but icons need to be created in the component
export const settingsItemsConfig = [
  {
    title: 'Edit Profile',
    iconName: 'person-outline',
    iconLibrary: 'MaterialIcons' as const,
    iconColor: '#104911',
    route: '../(screens)/EditProfile',
    rightText: 'Edit',
  },
  {
    title: 'Push Notifications',
    iconName: 'notifications-none',
    iconLibrary: 'MaterialIcons' as const,
    iconColor: '#104911',
    hasToggle: true,
  },
  {
    title: 'Help Center',
    iconName: 'help-circle',
    iconLibrary: 'Feather' as const,
    iconColor: '#104911',
    action: 'help',
  },
  {
    title: 'Invite Friends',
    iconName: 'person-add-outline',
    iconLibrary: 'Ionicons' as const,
    iconColor: '#104911',
    action: 'invite',
  },
  {
    title: 'Logout',
    iconName: 'logout',
    iconLibrary: 'MaterialIcons' as const,
    iconColor: '#AA2A2A',
    textColor: '#AA2A2A',
    action: 'logout',
  },
];