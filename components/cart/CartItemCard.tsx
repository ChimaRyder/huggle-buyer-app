import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { CartItem } from '../../data/food/models';
import { Ionicons } from '@expo/vector-icons';

interface CartItemCardProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  onUpdateInstructions: () => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ 
  item, 
  onIncrease, 
  onDecrease, 
  onRemove,
  onUpdateInstructions
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <Ionicons name="close" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
        
        {item.specialInstructions ? (
          <TouchableOpacity onPress={onUpdateInstructions} style={styles.instructionsContainer}>
            <Text style={styles.instructionsText} numberOfLines={1}>
              "{item.specialInstructions}"
            </Text>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onUpdateInstructions} style={styles.addInstructionsContainer}>
            <Text style={styles.addInstructionsText}>+ Add instructions</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.footer}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={[styles.quantityButton, item.quantity <= 1 && styles.disabledButton]} 
              onPress={onDecrease}
              disabled={item.quantity <= 1}
            >
              <Ionicons 
                name="remove" 
                size={16} 
                color={item.quantity > 1 ? "#000000" : "#C7C7CC"} 
              />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={onIncrease}
            >
              <Ionicons name="add" size={16} color="#000000" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.price}>${(item.price * item.quantity).toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    margin: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  instructionsContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 12,
    color: '#8E8E93',
    flex: 1,
    marginRight: 4,
  },
  editText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  addInstructionsContainer: {
    marginBottom: 8,
  },
  addInstructionsText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});

export default CartItemCard;