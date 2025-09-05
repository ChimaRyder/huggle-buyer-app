import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { foodCategories } from '@/data/food/mockData';
import { colors } from '@/constants/theme';

interface CategorySectionProps {
  onCategoryPress: (categoryId: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ onCategoryPress }) => {
  return (
    <View style={styles.section}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {foodCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryCard, { backgroundColor: category.color }]}
            onPress={() => onCategoryPress(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoriesContent: {
    paddingRight: 16,
    paddingBottom: 10,
  },
  categoryCard: {
    width: 80,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.inverse,
    textAlign: 'center',
  },
});

export default CategorySection;