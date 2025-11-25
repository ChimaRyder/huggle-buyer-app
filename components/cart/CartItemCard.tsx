import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { CartItem } from '../../data/food/models';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

interface CartItemCardProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  onToggleSelection?: () => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ 
  item, 
  onIncrease, 
  onDecrease, 
  onRemove,
  onToggleSelection
}) => {
  // Check if item is expired or inactive
  const isExpired = item.expiresAt ? new Date(item.expiresAt) <= new Date() : false;
  const isInactive = item.isActive === false;
  const isUnavailable = isExpired || isInactive;

  // Swipe gesture state
  const translateX = React.useRef(new Animated.Value(0)).current;
  const [isSwipedOpen, setIsSwipedOpen] = React.useState(false);

  // Debug store data
  React.useEffect(() => {
    console.log('🛒 CartItemCard: Item data:', {
      name: item.name,
      storeName: item.storeName,
      storeProfileImage: item.storeProfileImage,
      storeId: item.storeId,
      allKeys: Object.keys(item)
    });
  }, [item]);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      
      if (translationX < -80) {
        // Swipe left to show delete
        setIsSwipedOpen(true);
        Animated.spring(translateX, {
          toValue: -80,
          useNativeDriver: true,
        }).start();
      } else {
        // Return to original position
        setIsSwipedOpen(false);
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handleDelete = () => {
    // Close swipe first, then delete
    setIsSwipedOpen(false);
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      onRemove();
    });
  };
  return (
    <View style={[styles.container, isUnavailable && styles.unavailableContainer]}>
      {/* Swipeable content */}
      <View style={styles.swipeContainer}>
        {/* Delete button background - always present but behind content */}
        <View style={styles.deleteAction}>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color="white" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Main content that slides over the delete button */}
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View 
            style={[
              styles.swipeableContent,
              { transform: [{ translateX }] }
            ]}
          >
            {/* Main content row */}
            <View style={styles.mainContent}>
              {/* Left side with checkbox */}
              <View style={styles.leftColumn}>
                {onToggleSelection && (
                  <TouchableOpacity 
                    style={styles.checkbox} 
                    onPress={() => {
                      // For unavailable items, only allow deselection
                      if (isUnavailable && !item.selected) {
                        return; // Don't allow selection of unavailable items
                      }
                      onToggleSelection();
                    }}
                    disabled={false}
                  >
                    <View style={[
                      styles.checkboxInner, 
                      item.selected && styles.checkboxSelected,
                      isUnavailable && !item.selected && styles.checkboxDisabled
                    ]}>
                      {item.selected && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              {/* Product image */}
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
              
              {/* Product details */}
              <View style={styles.content}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                  {item.isBundle && (
                    <View style={styles.bundleBadge}>
                      <Text style={styles.bundleBadgeText}>Bundle</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                
                {/* Show bundle products if it's a bundle */}
                {item.isBundle && item.bundleProducts && item.bundleProducts.length > 0 && (
                  <View style={styles.bundleProducts}>
                    <Text style={styles.bundleProductsText}>
                      Includes: {item.bundleProducts.map(p => p.name).join(', ')}
                    </Text>
                  </View>
                )}
                
                <View style={styles.footer}>
                  <Text style={styles.price}>₱{(item.price * item.quantity).toFixed(2)}</Text>
                  
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                      style={[styles.quantityButton, (item.quantity <= 1 || isUnavailable) && styles.disabledButton]} 
                      onPress={onDecrease}
                      disabled={isUnavailable}
                    >
                      <Ionicons 
                        name="remove" 
                        size={16} 
                        color={item.quantity > 0 && !isUnavailable ? colors.primary.main : "#C7C7CC"}
                      />
                    </TouchableOpacity>
                    
                    <Text style={[styles.quantityText, isUnavailable && styles.unavailableText]}>{item.quantity}</Text>
                    
                    <TouchableOpacity 
                      style={[styles.quantityButton, isUnavailable && styles.disabledButton]} 
                      onPress={onIncrease}
                      disabled={isUnavailable}
                    >
                      <Ionicons name="add" size={16} color={isUnavailable ? "#C7C7CC" : colors.primary.main} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  swipeContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  swipeableContent: {
    backgroundColor: colors.background.primary,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftColumn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 100,
  },
  imageContainer: {
    width: 80,
    height: 80,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    flex: 1,
  },
  bundleBadge: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  bundleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.warning,
    textTransform: 'uppercase',
  },
  bundleProducts: {
    marginTop: 4,
    marginBottom: 4,
  },
  bundleProductsText: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontStyle: 'italic',
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
    color: colors.primary.main,
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
    // Center the checkbox vertically in the left column
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
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  checkboxDisabled: {
    opacity: 0.5,
    backgroundColor: '#f5f5f5',
    borderColor: '#d1d1d6',
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
  deleteAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.danger,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  deleteText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default CartItemCard;
