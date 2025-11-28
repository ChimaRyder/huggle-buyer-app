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
    backgroundColor: colors.background.primary,
    padding: 12,
    marginBottom: 8,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  promoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoInput: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 6,
  },
  applyButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  disabledApplyButton: {
    backgroundColor: colors.text.tertiary,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primaryInverted,
  },
});

export default PromoCodeInput;