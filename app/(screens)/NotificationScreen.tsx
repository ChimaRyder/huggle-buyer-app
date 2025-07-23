import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const mockNotifications = [
  {
    id: "1",
    type: "order",
    title: "Order Shipped!",
    message: "Your order #12345 has been shipped.",
    date: "2025-07-23 09:30",
  },
  {
    id: "2",
    type: "product",
    title: "New Product from Favorite Store",
    message: "Check out the new Mango Tart at Sweet Treats!",
    productId: "mango-tart-001",
    storeName: "Sweet Treats",
    date: "2025-07-22 16:10",
  },
  {
    id: "3",
    type: "order",
    title: "Order Delivered!",
    message: "Your order #12345 has been delivered.",
    date: "2025-07-21 18:45",
  },
  {
    id: "4",
    type: "product",
    title: "Promo at Coffee Corner",
    message: "Coffee Corner is offering 20% off on all drinks!",
    productId: "coffee-corner-promo",
    storeName: "Coffee Corner",
    date: "2025-07-20 12:00",
  },
];

const NotificationScreen = () => {
  const navigation = useNavigation();

  const handlePress = (notif) => {
    if (notif.type === "order") {
      navigation.navigate("Orders");
    } else if (notif.type === "product" && notif.productId) {
      navigation.navigate("ProductScreen", { productId: notif.productId });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
      <View style={styles.iconWrapper}>
        <Image
          source={
            item.type === "order"
              ? require("../../assets/icons/bell.png")
              : require("../../assets/icons/location.png")
          }
          style={styles.icon}
        />
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <FlatList
        data={mockNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
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
    textAlign: "center",
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
