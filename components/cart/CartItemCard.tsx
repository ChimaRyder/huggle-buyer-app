import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { CartItem } from '../../data/food/models';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

interface CartItemCardProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  onUpdateInstructions: () => void;
  onToggleSelection?: () => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ 
  item, 
  onIncrease, 
  onDecrease, 
  onRemove,
  onUpdateInstructions,
  onToggleSelection
}) => {
  // Check if item is expired or inactive
  const isExpired = item.expiresAt ? new Date(item.expiresAt) <= new Date() : false;
  const isInactive = item.isActive === false;
  const isUnavailable = isExpired || isInactive;
  return (
    <View style={[styles.container, isUnavailable && styles.unavailableContainer]}>
      {onToggleSelection && (
        <TouchableOpacity 
          style={styles.checkbox} 
          onPress={onToggleSelection}
          disabled={isUnavailable}
        >
          <View style={[styles.checkboxInner, item.selected && styles.checkboxSelected]}>
            {item.selected && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
        </TouchableOpacity>
      )}
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={[styles.image, isUnavailable && styles.unavailableImage]} />
        {isUnavailable && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>
              {isExpired ? 'Expired' : 'Unavailable'}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <Ionicons name="close" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.footer}>
          <Text style={styles.price}>${(item.price * item.quantity).toFixed(2)}</Text>
          
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={[styles.quantityButton, (item.quantity <= 1 || isUnavailable) && styles.disabledButton]} 
              onPress={onDecrease}
              disabled={item.quantity <= 1 || isUnavailable}
            >
              <Ionicons 
                name="remove" 
                size={16} 
                color={item.quantity > 1 && !isUnavailable ? colors.primary : "#C7C7CC"} 
              />
            </TouchableOpacity>
            
            <Text style={[styles.quantityText, isUnavailable && styles.unavailableText]}>{item.quantity}</Text>
            
            <TouchableOpacity 
              style={[styles.quantityButton, isUnavailable && styles.disabledButton]} 
              onPress={onIncrease}
              disabled={isUnavailable}
            >
              <Ionicons name="add" size={16} color={isUnavailable ? "#C7C7CC" : colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    padding: 12,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  description: {
    fontSize: 12,
    color: colors.text.tertiary,
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    minWidth: 24,
    textAlign: 'center',
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unavailableContainer: {
    opacity: 0.7,
  },
  unavailableImage: {
    opacity: 0.5,
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  unavailableText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CartItemCard;
