import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Text, Button } from "@ui-kitten/components";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

interface OrderCardProps {
  order: {
    id: string;
    date: string;
    productName: string;
    price: string;
    description: string;
    storeName: string;
    location: string;
    status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
    image: any;
  };
  onCancel?: () => void;
  showCancelButton?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onCancel,
  showCancelButton = false,
}) => {
  const canCancel =
    (order.status === "Pending" || order.status === "Confirmed") &&
    showCancelButton;

  return (
    <View style={styles.card}>
      <Text appearance="hint" style={styles.dateText}>
        {order.date}
      </Text>

      <View style={styles.contentRow}>
        <Image source={order.image} style={styles.image} />

        <View style={styles.infoColumn}>
          <View style={styles.titleRow}>
            <Text category="s1" style={styles.productName}>
              {order.productName}
            </Text>
            <Text status="primary" style={styles.price}>
              {order.price}
            </Text>
          </View>
          <Text appearance="hint" numberOfLines={1} style={styles.description}>
            {order.description}
          </Text>
          <View style={styles.locationRow}>
            <FontAwesome5 name="store" size={14} color="#104911" />
            <Text style={styles.metaText}> {order.storeName} | </Text>
            <Ionicons name="location-sharp" size={14} color="#104911" />
            <Text style={styles.metaText}> {order.location}</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={[styles.statusBadge, getStatusStyle(order.status)]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>

        {canCancel && onCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={(e) => {
              e.stopPropagation();
              onCancel();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default OrderCard;

const getStatusStyle = (status: string) => ({
  backgroundColor:
    status === "Completed"
      ? "#D4EDDA"
      : status === "Cancelled"
      ? "#F8D7DA"
      : status === "Confirmed"
      ? "#D1ECF1"
      : "#FFF3CD", // Pending
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 25,
    marginBottom: 19,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  dateText: {
    marginBottom: 8,
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#F9A620",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  infoColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productName: {
    fontFamily: "Poppins-SemiBold",
    color: "#104911",
  },
  price: {
    fontWeight: "bold",
    color: "#000000",
  },
  description: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
