import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

const SearchEmptyState: React.FC = () => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={64} color={colors.text.tertiary} />
      <Text style={styles.emptyTitle}>Search for restaurants or food</Text>
      <Text style={styles.emptyDescription}>
        Find your favorite restaurants and food items
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default SearchEmptyState;