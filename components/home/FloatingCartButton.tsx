import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

interface FloatingCartButtonProps {
  onPress: () => void;
  itemCount: number;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ 
  onPress, 
  itemCount 
}) => {
  return (
    <TouchableOpacity
      style={styles.floatingCartButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name="cart" size={24} color={colors.text.inverse} />
      {itemCount > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{itemCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingCartButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.danger,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: '600',
  },
});

export default FloatingCartButton;