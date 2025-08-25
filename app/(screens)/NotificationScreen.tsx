import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  Alert,
} from "react-native";
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

// Define notification types relevant to a produce app
type NotificationType = 
  | "OrderReady"
  | "OrderConfirmed"
  | "NewProduct"
  | "PriceDrop"
  | "SeasonalOffer"
  | "DeliveryUpdate";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
};

// Mock notification data for a produce app
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "OrderReady",
    title: "Order Ready for Pickup",
    message: "Your organic apples from Farm Fresh Market are ready for pickup.",
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    isRead: false,
  },
  {
    id: "2",
    type: "NewProduct",
    title: "Fresh Strawberries In Season",
    message: "Sweet organic strawberries are now available at Berry Best.",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    isRead: false,
  },
  {
    id: "3",
    type: "PriceDrop",
    title: "Price Drop on Kale",
    message: "Organic kale is now 20% off at Green Thumb Grocers.",
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    isRead: true,
  },
  {
    id: "4",
    type: "OrderConfirmed",
    title: "Order Confirmed",
    message: "Your order of fresh carrots and sweet potatoes has been confirmed.",
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    isRead: true,
  },
  {
    id: "5",
    type: "SeasonalOffer",
    title: "Seasonal Produce Sale",
    message: "Get 15% off all seasonal vegetables this week only.",
    createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    isRead: true,
  },
  {
    id: "6",
    type: "DeliveryUpdate",
    title: "Delivery Delayed",
    message: "Your organic herbs delivery will be delayed by 30 minutes.",
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    isRead: false,
  },
  {
    id: "7",
    type: "NewProduct",
    title: "Exotic Mangoes Available",
    message: "Fresh tropical mangoes now available at Tropical Paradise.",
    createdAt: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
    isRead: true,
  },
];

// Get icon based on notification type
const getIconForType = (type: NotificationType) => {
  switch (type) {
    case "OrderReady":
      return require("../../assets/icons/bell.png");
    case "OrderConfirmed":
      return require("../../assets/icons/bell.png");
    case "NewProduct":
      return require("../../assets/icons/bell.png");
    case "PriceDrop":
      return require("../../assets/icons/bell.png");
    case "SeasonalOffer":
      return require("../../assets/icons/bell.png");
    case "DeliveryUpdate":
      return require("../../assets/icons/location.png");
    default:
      return require("../../assets/icons/bell.png");
  }
};

// Get background color based on notification type
const getColorForType = (type: NotificationType) => {
  switch (type) {
    case "OrderReady":
      return colors.success; // Green
    case "OrderConfirmed":
      return colors.info; // Blue
    case "NewProduct":
      return colors.secondary; // Blue-Green
    case "PriceDrop":
      return colors.warning; // Amber
    case "SeasonalOffer":
      return colors.primary; // Primary Green
    case "DeliveryUpdate":
      return colors.danger; // Red
    default:
      return colors.gray500; // Gray
  }
};

const NotificationScreen = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [refreshing, setRefreshing] = useState(false);

  const handlePress = (notif: Notification) => {
    if (!notif.isRead) {
      // Mark as read
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    }
    
    // Navigate based on notification type
    if (notif.type === "OrderReady" || notif.type === "OrderConfirmed" || notif.type === "DeliveryUpdate") {
      router.push("/(screens)/Orders");
    } else if (notif.type === "NewProduct") {
      router.push("/(screens)/SearchScreen");
    }
  };

  const handleDelete = (notifId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    Alert.alert("Success", "All notifications marked as read");
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
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Ionicons
            name="notifications"
            size={32}
            color={colors.primary}
            style={styles.headerIcon}
          />
          <Text style={styles.header}>Notifications</Text>
          <TouchableOpacity 
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        </View>
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
          contentContainerStyle={{ paddingBottom: 24 }}
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
      </View>
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
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  headerIcon: {
    marginRight: 10,
    bottom: 10,
  },
  header: {
    fontSize: 28,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 18,
    color: colors.text.primary,
    flex: 1,
  },
  markAllButton: {
    marginBottom: 18,
  },
  markAllText: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
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
    fontFamily: "Poppins-SemiBold",
    color: colors.text.primary,
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
    fontFamily: "Poppins-Regular",
  },
  date: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontFamily: "Poppins-Regular",
  },
  menuOptionText: {
    padding: 8,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});

export default NotificationScreen;
