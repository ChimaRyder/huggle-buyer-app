import React from "react";
import { Modal, View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@ui-kitten/components";
import { Ionicons } from "@expo/vector-icons";

interface AddToCartModalProps {
  visible: boolean;
  productName: string;
  quantity: number;
  onContinue: () => void;
  onViewCart: () => void;
  onClose: () => void;
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({
  visible,
  productName,
  quantity,
  onContinue,
  onViewCart,
  onClose,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>

          {/* Success icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle-outline" size={48} color="#548C2F" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Added to Cart!</Text>

          {/* Message */}
          <Text style={styles.message}>
            {quantity} {productName} added to your cart
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.continueButton, styles.button]} onPress={onContinue}>
              <Text style={styles.continueButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.viewCartButton, styles.button]} onPress={onViewCart}>
              <Text style={styles.viewCartButtonText}>View Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 4,
  },
  iconContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 8,
  },
  button: {
    flex: 1,
    minWidth: 140,
    marginVertical: 4,
  },
  continueButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 6,
  },
  continueButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
  viewCartButton: {
    flex: 1,
    backgroundColor: "#548C2F",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginLeft: 6,
  },
  viewCartButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default AddToCartModal;
