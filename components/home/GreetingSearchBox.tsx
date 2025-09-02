import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

interface GreetingSearchBoxProps {
  greeting: string;
  timeOfDay: string;
  onFocus: () => void;
}

const GreetingSearchBox: React.FC<GreetingSearchBoxProps> = ({ greeting, timeOfDay, onFocus }) => {
  // Split the greeting to color the time of day
  const parts = greeting.split(timeOfDay);
  
  return (
    <View style={styles.container}>
      <Text style={styles.greetingText}>
        {parts[0]}
        <Text style={styles.timeOfDayText}>{timeOfDay}</Text>
        {parts[1]}
      </Text>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.icon.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants or food items"
          onFocus={onFocus}
          placeholderTextColor={colors.text.tertiary}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E8F5E9', // Light pastel green background
    borderRadius: 10,
    padding: 16,
    marginVertical: 16,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.84,
    elevation: 3,
  },
  greetingText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: colors.text.primary,
    marginBottom: 12,
  },
  timeOfDayText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: colors.primary, // Regular primary green for the time of day
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
});

export default GreetingSearchBox;