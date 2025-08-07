import React, { useEffect, useState, useCallback } from "react";
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
import { useUser, useAuth } from "@clerk/clerk-expo";
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  markAllNotificationsAsRead,
} from "../../utils/notificationApi";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider,
} from "react-native-popup-menu";
import Ionicons from "react-native-vector-icons/Ionicons";

// Map backend type number to string
const NOTIF_TYPE_MAP: Record<number, "NewProduct" | "NewPost" | "OrderReady"> =
  {
    0: "NewProduct",
    1: "NewPost",
    2: "OrderReady",
  };

const NOTIF_TYPES = ["NewProduct", "NewPost", "OrderReady"];

type Notification = {
  id: string;
  type: "NewProduct" | "NewPost" | "OrderReady";
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  [key: string]: any;
};

const NotificationScreen = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [menuVisibleId, setMenuVisibleId] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    if (initialLoad) setLoading(true);
    try {
      const token = await getToken({ template: "seller_app" });
      const res = await getNotifications(user.id, token);
      // Map backend type (number) to string
      const mapped = (res.notifications || []).map((n: any) => ({
        ...n,
        type: typeof n.type === "number" ? NOTIF_TYPE_MAP[n.type] : n.type,
      }));
      setNotifications(
        mapped.filter((n: Notification) => NOTIF_TYPES.includes(n.type))
      );
    } catch (e) {
      Alert.alert("Error", "Failed to load notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setInitialLoad(false);
    }
  }, [user, getToken, initialLoad]);

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handlePress = async (notif: Notification) => {
    if (!notif.isRead) {
      try {
        const token = await getToken({ template: "seller_app" });
        await markNotificationAsRead(notif.id, token);
        setNotifications((prev: Notification[]) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
      } catch {}
    }
    if (notif.type === "OrderReady") {
      router.push("/(screens)/Orders");
    } else if (notif.type === "NewProduct" || notif.type === "NewPost") {
      router.push("/(tabs)/FavoritesScreen");
    }
  };

  const handleDelete = async (notifId: string) => {
    try {
      const token = await getToken({ template: "seller_app" });
      await deleteNotification(notifId, token);
      setNotifications((prev: Notification[]) =>
        prev.filter((n) => n.id !== notifId)
      );
    } catch {
      Alert.alert("Error", "Failed to delete notification");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <View style={{ position: "relative" }}>
      <TouchableOpacity
        style={[styles.card, item.isRead ? { opacity: 0.5 } : {}]}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.iconWrapper}>
          <Image
            source={
              item.type === "OrderReady"
                ? require("../../assets/icons/bell.png")
                : require("../../assets/icons/location.png")
            }
            style={styles.icon}
          />
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
        <Menu>
          <MenuTrigger>
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color="#888"
              style={{ padding: 8 }}
            />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption onSelect={() => handleDelete(item.id)}>
              <Text style={{ color: "#d00", padding: 8 }}>Delete</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </TouchableOpacity>
    </View>
  );

  return (
    <MenuProvider>
      <View style={styles.container}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <Ionicons
            name="notifications"
            size={32}
            color="#548C2F"
            style={{ marginRight: 10, bottom: 10 }}
          />
          <Text style={styles.header}>Notifications</Text>
        </View>
        {loading && initialLoad ? (
          <Text>Loading...</Text>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#548C2F"]}
              />
            }
            contentContainerStyle={{ paddingBottom: 24 }}
            ListEmptyComponent={<Text>No notifications</Text>}
          />
        )}
      </View>
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 28,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 18,
    color: "#222",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#f7f7f7",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrapper: {
    marginRight: 16,
  },
  icon: {
    width: 32,
    height: 32,
    tintColor: "#4CAF50",
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontFamily: "Poppins-SemiBold",
    color: "#222",
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    fontFamily: "Poppins-Regular",
  },
  date: {
    fontSize: 12,
    color: "#999",
    fontFamily: "Poppins-Regular",
  },
});

export default NotificationScreen;
