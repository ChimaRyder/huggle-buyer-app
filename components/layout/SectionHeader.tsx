import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { fontSizes, spacing } from "../../constants/theme";

interface SectionHeaderProps {
  title: string;
  right?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  right,
  style,
  titleStyle,
}) => (
  <View style={[styles.row, style]} accessibilityRole="header">
    <Text style={[styles.title, titleStyle]} accessibilityRole="text">
      {title}
    </Text>
    {right}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: "bold",
    color: "#222",
  },
});

export default SectionHeader;
