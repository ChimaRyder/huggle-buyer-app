export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export const PRODUCT_CATEGORIES: Category[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    icon: '📱',
    color: '#4F46E5',
    description: 'Phones, laptops, gadgets and tech accessories'
  },
  {
    id: 'fashion',
    name: 'Fashion',
    icon: '👕',
    color: '#EC4899',
    description: 'Clothing, shoes, and fashion accessories'
  },
  {
    id: 'food-drinks',
    name: 'Food & Drinks',
    icon: '🍕',
    color: '#F59E0B',
    description: 'Fresh food, snacks, beverages and groceries'
  },
  {
    id: 'health-beauty',
    name: 'Health & Beauty',
    icon: '💄',
    color: '#10B981',
    description: 'Skincare, makeup, wellness and health products'
  },
  {
    id: 'home-garden',
    name: 'Home & Garden',
    icon: '🏠',
    color: '#8B5CF6',
    description: 'Home decor, furniture, gardening supplies'
  },
  {
    id: 'sports-outdoors',
    name: 'Sports & Outdoors',
    icon: '⚽',
    color: '#EF4444',
    description: 'Sports equipment, outdoor gear and fitness'
  },
  {
    id: 'books-media',
    name: 'Books & Media',
    icon: '📚',
    color: '#6366F1',
    description: 'Books, music, movies and educational content'
  },
  {
    id: 'toys-games',
    name: 'Toys & Games',
    icon: '🎮',
    color: '#F97316',
    description: 'Toys, board games, video games and hobbies'
  }
];

// Helper function to get category by ID
export const getCategoryById = (categoryId: string): Category | undefined => {
  return PRODUCT_CATEGORIES.find(category => category.id === categoryId);
};

// Helper function to get categories by name search
export const searchCategories = (searchTerm: string): Category[] => {
  return PRODUCT_CATEGORIES.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
};