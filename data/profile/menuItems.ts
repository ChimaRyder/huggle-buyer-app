/**
 * Profile screen navigation menu items
 * Used for the main profile screen menu options
 */

export interface ProfileMenuItem {
  id: string;
  title: string;
  icon: string;
  screen: string;
}

export const profileMenuItems: ProfileMenuItem[] = [
  {
    id: 'orders',
    title: 'My Orders',
    icon: 'receipt-outline',
    screen: '/(screens)/Orders',
  },
  {
    id: 'favorites',
    title: 'Favorite Stores',
    icon: 'heart-outline',
    screen: '/(screens)/FavoritesScreen',
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'settings-outline',
    screen: '/(screens)/SettingsScreen',
  },
  {
    id: 'support',
    title: 'Help & Support',
    icon: 'help-circle-outline',
    screen: 'SupportScreen',
  },
];