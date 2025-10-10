import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApi } from '@/context/ApiContext';
import { updatePushTokenStatus, enablePushToken, disablePushToken } from '@/utils/pushToken';

interface PushNotificationPreferences {
  isEnabled: boolean;
  isLoading: boolean;
}

export const usePushNotifications = () => {
  const [preferences, setPreferences] = useState<PushNotificationPreferences>({
    isEnabled: true,
    isLoading: true,
  });
  const { client: apiClient } = useApi();

  // Load preferences on component mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem('pushNotificationEnabled');
      const isEnabled = stored !== null ? JSON.parse(stored) : true; // Default to true
      
      setPreferences({
        isEnabled,
        isLoading: false,
      });
      
      console.log('📱 PushNotifications: Loaded preferences:', { isEnabled });
    } catch (error) {
      console.error('❌ PushNotifications: Error loading preferences:', error);
      setPreferences({
        isEnabled: true,
        isLoading: false,
      });
    }
  };

  const updatePreferences = async (enabled: boolean) => {
    try {
      setPreferences(prev => ({ ...prev, isLoading: true }));
      
      console.log(`📱 PushNotifications: Updating preferences to ${enabled ? 'enabled' : 'disabled'}`);
      
      // Store preference locally
      await AsyncStorage.setItem('pushNotificationEnabled', JSON.stringify(enabled));
      
      // Update push token status on backend
      const tokenId = await AsyncStorage.getItem('pushTokenId');
      if (tokenId) {
        const response = enabled 
          ? await enablePushToken(apiClient, tokenId)
          : await disablePushToken(apiClient, tokenId);
          
        if (!response.success) {
          console.error('❌ PushNotifications: Failed to update backend status:', response.error);
          // Note: We still update local preference even if backend fails
          // This allows users to toggle the setting even if there are temporary network issues
        } else {
          console.log('✅ PushNotifications: Backend status updated successfully');
        }
      } else {
        console.log('⚠️ PushNotifications: No token ID found, only updating local preference');
      }
      
      setPreferences({
        isEnabled: enabled,
        isLoading: false,
      });
      
    } catch (error) {
      console.error('❌ PushNotifications: Error updating preferences:', error);
      
      // Revert to previous state on error
      setPreferences(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  return {
    preferences,
    updatePreferences,
    reload: loadPreferences,
  };
};