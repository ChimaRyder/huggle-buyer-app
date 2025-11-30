import React from 'react';
import { Modal, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { colors, spacing, typography, radii } from '@/constants/theme';

interface ContentModalProps {
  visible: boolean;
  title: string;
  content: string;
  onClose: () => void;
}

const ContentModal: React.FC<ContentModalProps> = ({
  visible,
  title,
  content,
  onClose,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <Markdown
              style={{
                body: {
                  fontSize: typography.fontSizes.md,
                  color: colors.text.primary,
                  lineHeight: typography.lineHeights.normal * typography.fontSizes.md,
                },
                heading1: {
                  fontSize: typography.fontSizes.xxl,
                  fontWeight: typography.fontWeights.bold,
                  color: colors.text.primary,
                  marginTop: spacing.md,
                  marginBottom: spacing.md,
                },
                heading2: {
                  fontSize: typography.fontSizes.xl,
                  fontWeight: typography.fontWeights.bold,
                  color: colors.text.primary,
                  marginTop: spacing.md,
                  marginBottom: spacing.sm,
                },
                heading3: {
                  fontSize: typography.fontSizes.lg,
                  fontWeight: typography.fontWeights.semibold,
                  color: colors.text.primary,
                  marginTop: spacing.sm,
                  marginBottom: spacing.xs,
                },
                paragraph: {
                  marginBottom: spacing.md,
                  color: colors.text.secondary,
                  lineHeight: typography.lineHeights.normal * typography.fontSizes.md,
                },
                strong: {
                  fontWeight: typography.fontWeights.bold,
                  color: colors.text.primary,
                },
                bullet_list: {
                  marginBottom: spacing.md,
                },
                bullet_list_icon: {
                  color: colors.text.secondary,
                  fontSize: typography.fontSizes.md,
                },
                list_item: {
                  marginBottom: spacing.xs,
                  color: colors.text.secondary,
                },
                hr: {
                  backgroundColor: colors.border.primary,
                  height: 1,
                  marginVertical: spacing.lg,
                },
              }}
            >
              {content}
            </Markdown>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    height: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
});

export default ContentModal;
