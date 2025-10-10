import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/constants/theme';

interface StoreSearchInputProps {
  onSearchChange: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  initialValue?: string;
}

const StoreSearchInput: React.FC<StoreSearchInputProps> = ({
  onSearchChange,
  placeholder = "Search products in this store...",
  autoFocus = false,
  initialValue = "",
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const focusAnimation = new Animated.Value(0);

  useEffect(() => {
    // Debounce search to avoid too many calls
    const timer = setTimeout(() => {
      onSearchChange(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearchChange]);

  useEffect(() => {
    Animated.timing(focusAnimation, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearchChange('');
  };

  const animatedBorderColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border.primary, colors.primary.main],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.searchContainer, { borderColor: animatedBorderColor }]}>
        <Ionicons 
          name="search-outline" 
          size={20} 
          color={isFocused ? colors.primary.main : colors.text.tertiary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          returnKeyType="search"
          autoFocus={autoFocus}
          clearButtonMode="never" // We'll handle clear button manually
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={handleClearSearch}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="close-circle" 
              size={20} 
              color={colors.text.tertiary}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    paddingVertical: 0, // Remove default padding for better control
  },
  clearButton: {
    marginLeft: spacing.sm,
    padding: 2,
  },
});

export default StoreSearchInput;