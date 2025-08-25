import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { colors } from '@/constants/theme';

interface PromoCodeInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onApply: () => void;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({ 
  value, 
  onChangeText, 
  onApply 
}) => {
  return (
    <View style={styles.promoContainer}>
      <Text style={styles.promoTitle}>Promo Code</Text>
      <View style={styles.promoInputContainer}>
        <TextInput
          style={styles.promoInput}
          placeholder="Enter promo code"
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity 
          style={[styles.applyButton, !value && styles.disabledApplyButton]} 
          onPress={onApply}
          disabled={!value}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  promoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  promoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 8,
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  disabledApplyButton: {
    backgroundColor: '#C7C7CC',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PromoCodeInput;