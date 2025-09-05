import React from "react";
import { Modal, View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Button } from "@ui-kitten/components";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, radii } from "../../constants/theme";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonColor = colors.danger,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>

          {/* Warning icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="warning-outline" size={48} color={colors.warning} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              style={[styles.button, styles.cancelButton]}
              appearance="outline"
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </Button>

            <Button
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: confirmButtonColor },
              ]}
              onPress={onConfirm}
              disabled={loading}
            >
              <Text style={styles.confirmButtonText}>
                {loading ? "Processing..." : confirmText}
              </Text>
            </Button>
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
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    padding: spacing.xs,
  },
  iconContainer: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: typography.lineHeights.normal * typography.fontSizes.md,
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    borderRadius: radii.sm,
  },
  cancelButton: {
    borderColor: colors.border.primary,
  },
  confirmButton: {
    borderWidth: 0,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.semibold,
  },
  confirmButtonText: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeights.semibold,
  },
});

export default ConfirmationModal;
