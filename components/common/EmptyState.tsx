import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/constants/theme';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  iconColor?: string;
  iconSize?: number;
  containerStyle?: ViewStyle;
  testID?: string;
}

/**
 * EmptyState Component
 * 
 * A reusable component for displaying empty states throughout the app.
 * Features proper text wrapping, centered layout, and consistent styling.
 * 
 * @param icon - Icon name from Ionicons
 * @param title - Main title text
 * @param subtitle - Descriptive subtitle text
 * @param iconColor - Custom icon color (defaults to tertiary text color)
 * @param iconSize - Custom icon size (defaults to 64)
 * @param containerStyle - Additional container styles
 * @param testID - Test identifier for testing
 * 
 * @example
 * <EmptyState
 *   icon="chatbubbles-outline"
 *   title="No conversations yet"
 *   subtitle="Start chatting with stores by visiting their pages."
 * />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  iconColor = colors.text.tertiary,
  iconSize = 64,
  containerStyle,
  testID = 'empty-state',
}) => {
  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      <Ionicons name={icon} size={iconSize} color={iconColor} />
      <Text style={styles.title} numberOfLines={3}>
        {title}
      </Text>
      <Text style={styles.subtitle} numberOfLines={5}>
        {subtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    minHeight: 300, // Ensure minimum height for proper centering
  },
  title: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
    maxWidth: '85%', // Prevent text from touching edges
    lineHeight: typography.fontSizes.xxl * 1.3,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSizes.md * 1.5,
    maxWidth: '90%', // Ensure proper text wrapping
    paddingHorizontal: spacing.sm,
  },
});
