import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fontSizes, spacing, radii } from "../constants/theme";

interface TabBarProps {
  tabs: string[];
  activeIndex: number;
  onTabPress: (index: number) => void;
}

const tabIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: "home-outline",
  search: "search-outline",
  favorites: "heart-outline",
  favorite: "heart-outline",
  profile: "person-outline",
};

const TabBar: React.FC<TabBarProps> = ({ tabs, activeIndex, onTabPress }) => (
  <View style={styles.container} accessibilityRole="tablist">
    {tabs.map((tab, idx) => {
      const lower = tab.toLowerCase();
      const iconKey = Object.keys(tabIcons).find((key) => lower.includes(key));
      const iconName = iconKey ? tabIcons[iconKey] : "ellipse-outline";
      return (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeIndex === idx && styles.activeTab]}
          onPress={() => onTabPress(idx)}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeIndex === idx }}
          accessibilityLabel={tab}
        >
          <Ionicons
            name={iconName}
            size={20}
            color={activeIndex === idx ? "#fff" : "#104911"}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.tabText,
              activeIndex === idx && styles.activeTabText,
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.full,
    backgroundColor: "#f5f5f5",
    marginHorizontal: spacing.xs,
  },
  activeTab: {
    backgroundColor: "#F9A620",
  },
  tabText: {
    fontSize: fontSizes.md,
    color: "#104911",
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#fff",
  },
});

export default TabBar;
