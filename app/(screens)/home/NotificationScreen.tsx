import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider,
} from "react-native-popup-menu";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { useAuth } from "@clerk/clerk-expo";
import { 
  getNotifications, 
  markNotificationAsRead, 
  deleteNotification,
  markAllNotificationsAsRead 
} from "@/utils/notificationApi";

// Define notification types to match backend
type NotificationType = 
  | "OrderConfirmed"
  | "OrderReady"
  | "OrderCancelled"
  | "NewProduct"
  | "NewPost";

type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
};


// Get icon based on notification type
const getIconForType = (type: string) => {
  switch (type) {
    case "OrderReady":
      return require("@/assets/icons/bell.png");
    case "OrderConfirmed":
      return require("@/assets/icons/bell.png");
    case "OrderCancelled":
      return require("@/assets/icons/bell.png");
    case "NewProduct":
      return require("@/assets/icons/bell.png");
    case "NewPost":
      return require("@/assets/icons/bell.png");
    default:
      return require("@/assets/icons/bell.png");
  }
};

// Get background color based on notification type
const getColorForType = (type: string) => {
  switch (type) {
    case "OrderReady":
      return colors.success; // Green
    case "OrderConfirmed":
      return colors.info; // Blue
    case "OrderCancelled":
      return colors.danger; // Red
    case "NewProduct":
      return colors.secondary; // Blue-Green
    case "NewPost":
      return colors.primary; // Primary Green
    default:
      return colors.gray500; // Gray
  }
};

const NotificationScreen = () => {
  const router = useRouter();
  const { userId, getToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!userId) return;
    
    try {
      const token = await getToken({ template: "seller_app" });
      const data = await getNotifications(userId, token);
      setNotifications(data.data || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      Alert.alert("Error", "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const handlePress = async (notif: Notification) => {
    if (!notif.isRead && userId) {
      try {
        const token = await getToken({ template: "seller_app" });
        await markNotificationAsRead(notif.id, token);
        // Update local state
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
    
    // Navigate based on notification type and related entity
    if (notif.type === "OrderReady" || notif.type === "OrderConfirmed" || notif.type === "OrderCancelled") {
      if (notif.relatedEntityId) {
        router.push(`/(screens)/order/Orders`);
      } else {
        router.push("/(screens)/order/Orders");
      }
    } else if (notif.type === "NewProduct") {
      if (notif.relatedEntityId) {
        router.push(`/(screens)/store/ProductScreen?id=${notif.relatedEntityId}`);
      } else {
        router.push("/(screens)/search/SearchScreen");
      }
    } else if (notif.type === "NewPost") {
      if (notif.relatedEntityId) {
        router.push(`/(screens)/store/PostScreen?id=${notif.relatedEntityId}`);
      } else {
        router.push("/(screens)/search/SearchScreen");
      }
    }
  };

  const handleDelete = async (notifId: string) => {
    if (!userId) return;
    
    try {
      const token = await getToken({ template: "seller_app" });
      await deleteNotification(notifId, token);
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    } catch (error) {
      console.error("Failed to delete notification:", error);
      Alert.alert("Error", "Failed to delete notification");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    
    try {
      const token = await getToken({ template: "seller_app" });
      await markAllNotificationsAsRead(userId, token);
      setNotifications((prev) => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      Alert.alert("Success", "All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      Alert.alert("Error", "Failed to mark notifications as read");
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <View style={{ position: "relative" }}>
      <TouchableOpacity
        style={[styles.card, item.isRead ? styles.readCard : {}]}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <View 
          style={[
            styles.iconWrapper, 
            { backgroundColor: `${getColorForType(item.type)}20` }
          ]}
        >
          <Image
            source={getIconForType(item.type)}
            style={[styles.icon, { tintColor: getColorForType(item.type) }]}
          />
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.date}>
            {formatTimeAgo(item.createdAt)}
          </Text>
        </View>
        <Menu>
          <MenuTrigger>
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={colors.icon.secondary}
              style={{ padding: 8 }}
            />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption onSelect={() => handleDelete(item.id)}>
              <Text style={[styles.menuOptionText, { color: colors.danger }]}>Delete</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </TouchableOpacity>
    </View>
  );

  return (
    <MenuProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity 
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Ionicons
              name="checkmark-done"
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.container}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
              contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons 
                    name="notifications-off" 
                    size={64} 
                    color={colors.text.tertiary} 
                  />
                  <Text style={styles.emptyText}>No notifications</Text>
                  <Text style={styles.emptySubtext}>We'll notify you when something important happens</Text>
                </View>
              }
            />
          )}
        </View>
      </SafeAreaView>
    </MenuProvider>
  );
};

// Helper function to format time ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} years ago`;
  if (interval === 1) return "1 year ago";
  
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} months ago`;
  if (interval === 1) return "1 month ago";
  
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} days ago`;
  if (interval === 1) return "1 day ago";
  
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} hours ago`;
  if (interval === 1) return "1 hour ago";
  
  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} minutes ago`;
  if (interval === 1) return "1 minute ago";
  
  return "Just now";
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  markAllButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.background.primary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  readCard: {
    opacity: 0.7,
    borderLeftColor: colors.text.tertiary,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  icon: {
    width: 24,
    height: 24,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
    fontWeight: '400',
  },
  date: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '400',
  },
  menuOptionText: {
    padding: 8,
    fontSize: 14,
    fontWeight: '400',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '400',
    textAlign: "center",
    paddingHorizontal: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '400',
  },
});

export default NotificationScreen;
