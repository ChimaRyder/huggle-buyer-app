import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";
import { spacing } from "@/constants/theme";
import type { BackendBundle } from "@/types/BackendModels";
import BundleCard from "./BundleCard";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 20;
const GAP = 12;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (SCREEN_WIDTH - (HORIZONTAL_PADDING * 2) - GAP) / NUM_COLUMNS;

interface BundleGridProps {
  bundles: BackendBundle[];
  onBundlePress: (bundleId: string) => void;
}

export const BundleGrid: React.FC<BundleGridProps> = ({ bundles, onBundlePress }) => {
  const renderItem = ({ item, index }: { item: BackendBundle; index: number }) => {
    const isLeftColumn = index % 2 === 0;

    return (
      <View
        style={[
          styles.cardWrapper,
          {
            width: CARD_WIDTH,
            marginRight: isLeftColumn ? GAP : 0,
          }
        ]}
      >
        <BundleCard
          bundle={item}
          onPress={() => onBundlePress(item.id)}
          fullWidth
        />
      </View>
    );
  };

  return (
    <FlatList
      data={bundles}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={NUM_COLUMNS}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.lg,
  },
  cardWrapper: {
    marginBottom: spacing.md,
  },
});

export default BundleGrid;
