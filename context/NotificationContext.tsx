import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { registerForPushNotificationsAsync } from '@/utils/Notifications';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface NotificationContextType {
  expoPushToken?: string;
}

const NotificationContext = createContext<NotificationContextType>({});

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = React.useState<string>();
  
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    // Register for push notifications when user is signed in
    if (isSignedIn) {
      registerForPushNotificationsAsync().then(async (token) => {
        if (token) {
          setExpoPushToken(token);
          // Store token in backend
          try {
            const authToken = await getToken();
            if (authToken) {
              await registerForPushNotificationsAsync(authToken);
            }
          } catch (error) {
            console.error('Failed to store push token:', error);
          }
        }
      });
    }

    // Listen for notifications when app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
    });

    // Listen for notification interactions (taps)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      
      const { notification } = response;
      const data = notification.request.content.data;
      
      // Navigate based on notification data
      handleNotificationNavigation(data);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isSignedIn, getToken]);

  const handleNotificationNavigation = (data: any) => {
    const { type, relatedEntityId, relatedEntityType } = data;
    
    try {
      switch (type) {
        case 'OrderConfirmed':
        case 'OrderReady':
        case 'OrderCancelled':
          if (relatedEntityId) {
            router.push({
              pathname: '/(screens)/order/OrderDetails' as any,
              params: { orderId: relatedEntityId },
            });
          } else {
            router.push('/(screens)/order/Orders');
          }
          break;
          
        case 'NewProduct':
          if (relatedEntityId) {
            router.push(`/(screens)/store/ProductScreen?id=${relatedEntityId}`);
          } else {
            router.push('/(screens)/search/SearchScreen');
          }
          break;
          
        case 'NewPost':
          if (relatedEntityId) {
            router.push(`/(screens)/store/PostScreen?id=${relatedEntityId}`);
          } else {
            router.push('/(screens)/search/SearchScreen');
          }
          break;
          
        default:
          router.push('/(screens)/home/NotificationScreen');
          break;
      }
    } catch (error) {
      console.error('Navigation error from notification:', error);
      // Fallback to notifications screen
      router.push('/(screens)/home/NotificationScreen');
    }
  };

  return (
    <NotificationContext.Provider value={{ expoPushToken }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};