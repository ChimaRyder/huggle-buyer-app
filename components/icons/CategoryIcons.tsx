import React from 'react';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

// Electronics/Tech/Gadgets
export const ElectronicsIcon: React.FC<IconProps> = ({ size = 24, color = '#4F46E5' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 2H7C5.89543 2 5 2.89543 5 4V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V4C19 2.89543 18.1046 2 17 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="12" y1="18" x2="12.01" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Food & Drinks
export const FoodIcon: React.FC<IconProps> = ({ size = 24, color = '#F59E0B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C13.1046 2 14 2.89543 14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 10.8954 2 12 2Z"
      fill={color}
    />
    <Path
      d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 11.4477 3.44772 11 4 11H20C20.5523 11 21 11.4477 21 12Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="8" y1="15" x2="8" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="15" x2="12" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="16" y1="15" x2="16" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Fashion/Clothing
export const FashionIcon: React.FC<IconProps> = ({ size = 24, color = '#EC4899' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 4V8H20L22 21H2L4 8H9V4C9 2.89543 9.89543 2 11 2H13C14.1046 2 15 2.89543 15 4Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M9 8V6H15V8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Health & Beauty
export const HealthIcon: React.FC<IconProps> = ({ size = 24, color = '#10B981' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 12H18L15 21L9 3L6 12H2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

// Home & Garden
export const HomeIcon: React.FC<IconProps> = ({ size = 24, color = '#8B5CF6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M9 22V12H15V22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Sports & Outdoors
export const SportsIcon: React.FC<IconProps> = ({ size = 24, color = '#EF4444' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 12C6.48 12 10.94 10.5 14.64 7.36L16.36 9.08C14.2 12.1 12 14.5 12 18"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 12C17.52 12 13.06 13.5 9.36 16.64L7.64 14.92C9.8 11.9 12 9.5 12 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Books & Media
export const BooksIcon: React.FC<IconProps> = ({ size = 24, color = '#6366F1' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Toys & Games
export const ToysIcon: React.FC<IconProps> = ({ size = 24, color = '#F97316' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="6" y="6" width="12" height="12" rx="2" stroke={color} strokeWidth="2" />
    <Circle cx="9" cy="9" r="1" fill={color} />
    <Circle cx="15" cy="9" r="1" fill={color} />
    <Path d="M9 15C9.5 14 10.5 14 11 14S12.5 14 13 15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M6 12H2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M22 12H18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M12 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M12 18V22" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Gaming/Tech Gaming
export const GamingIcon: React.FC<IconProps> = ({ size = 24, color = '#6366F1' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 14H8V16H10V18H8V16H6V14Z"
      fill={color}
    />
    <Circle cx="15.5" cy="15.5" r="1.5" fill={color} />
    <Circle cx="18.5" cy="12.5" r="1.5" fill={color} />
    <Path
      d="M7 6H17C18.1046 6 19 6.89543 19 8V16C19 17.1046 18.1046 18 17 18H7C5.89543 18 5 17.1046 5 16V8C5 6.89543 5.89543 6 7 6Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Organic/Fresh/Natural
export const OrganicIcon: React.FC<IconProps> = ({ size = 24, color = '#10B981' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C13 2 14 3 14 4C14 5 13 6 12 6C11 6 10 5 10 4C10 3 11 2 12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 6C8 6 5 9 5 13C5 17 8 20 12 20C16 20 19 17 19 13C19 9 16 6 12 6Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 13C8 11.3431 9.34315 10 11 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Default/Unknown Category - Package/Box Icon
export const DefaultIcon: React.FC<IconProps> = ({ size = 24, color = '#4CAF50' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 8C21 8 21 8 21 8L12 13L3 8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 8V16C21 17.1046 20.1046 18 19 18H5C3.89543 18 3 17.1046 3 16V8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 13V18"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M3 8L12 3L21 8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Comprehensive category keyword mapping for better icon selection
const CATEGORY_KEYWORDS = {
  electronics: [
    'electronic', 'electronics', 'gadget', 'gadgets', 'tech', 'technology', 'digital',
    'smartphone', 'phone', 'mobile', 'computer', 'laptop', 'tablet', 'ipad', 'iphone',
    'headphone', 'earphone', 'speaker', 'camera', 'tv', 'television', 'monitor',
    'charger', 'cable', 'accessory', 'device', 'smart', 'bluetooth', 'wireless',
    'appliance', 'electrical', 'battery', 'power', 'usb', 'hdmi'
  ],
  food: [
    'food', 'foods', 'drink', 'drinks', 'beverage', 'beverages', 'grocery', 'groceries',
    'meal', 'meals', 'snack', 'snacks', 'fruit', 'fruits', 'vegetable', 'vegetables',
    'meat', 'dairy', 'bread', 'bakery', 'coffee', 'tea', 'juice', 'water', 'soda',
    'wine', 'beer', 'alcohol', 'restaurant', 'cafe', 'kitchen', 'cooking', 'recipe',
    'ingredient', 'spice', 'sauce', 'oil', 'sugar', 'salt', 'rice', 'pasta',
    'cereal', 'milk', 'cheese', 'yogurt', 'butter', 'egg', 'chicken', 'beef', 'fish'
  ],
  fashion: [
    'fashion', 'clothing', 'clothes', 'apparel', 'wear', 'shirt', 'pants', 'dress',
    'shoe', 'shoes', 'sneaker', 'boot', 'sandal', 'hat', 'cap', 'jacket', 'coat',
    'sweater', 'hoodie', 'jeans', 'shorts', 'skirt', 'blouse', 'tie', 'belt',
    'bag', 'purse', 'wallet', 'watch', 'jewelry', 'necklace', 'ring', 'earring',
    'bracelet', 'sunglasses', 'glasses', 'style', 'designer', 'brand', 'luxury'
  ],
  health: [
    'health', 'healthcare', 'medical', 'medicine', 'pharmacy', 'drug', 'vitamin',
    'supplement', 'beauty', 'cosmetic', 'skincare', 'makeup', 'cream', 'lotion',
    'shampoo', 'soap', 'toothpaste', 'dental', 'wellness', 'fitness', 'workout',
    'gym', 'exercise', 'yoga', 'meditation', 'therapy', 'treatment', 'hospital',
    'clinic', 'doctor', 'nurse', 'bandage', 'first aid', 'personal care'
  ],
  home: [
    'home', 'house', 'furniture', 'decor', 'decoration', 'interior', 'design',
    'living', 'bedroom', 'kitchen', 'bathroom', 'dining', 'office', 'workspace',
    'chair', 'table', 'bed', 'sofa', 'couch', 'desk', 'shelf', 'cabinet',
    'lamp', 'light', 'lighting', 'curtain', 'carpet', 'rug', 'pillow', 'blanket',
    'garden', 'gardening', 'plant', 'flower', 'tree', 'seed', 'pot', 'tool',
    'lawn', 'outdoor', 'patio', 'cleaning', 'vacuum', 'broom', 'detergent'
  ],
  sports: [
    'sport', 'sports', 'athletic', 'fitness', 'exercise', 'workout', 'gym',
    'outdoor', 'recreation', 'activity', 'ball', 'football', 'soccer', 'basketball',
    'tennis', 'golf', 'baseball', 'volleyball', 'swimming', 'running', 'cycling',
    'bike', 'bicycle', 'skateboard', 'ski', 'snowboard', 'hiking', 'camping',
    'fishing', 'hunting', 'climbing', 'equipment', 'gear', 'training', 'match',
    'competition', 'tournament', 'league', 'team', 'player', 'coach'
  ],
  books: [
    'book', 'books', 'reading', 'literature', 'novel', 'magazine', 'newspaper',
    'journal', 'diary', 'education', 'educational', 'learning', 'study', 'student',
    'school', 'college', 'university', 'academic', 'textbook', 'manual', 'guide',
    'reference', 'dictionary', 'encyclopedia', 'media', 'publishing', 'author',
    'writer', 'library', 'bookstore', 'kindle', 'ebook', 'audiobook', 'podcast'
  ],
  toys: [
    'toy', 'toys', 'kid', 'kids', 'child', 'children', 'baby', 'infant',
    'doll', 'action figure', 'puzzle', 'lego', 'block', 'board game', 'card game',
    'stuffed animal', 'teddy bear', 'robot', 'car', 'truck', 'train', 'plane',
    'bike', 'scooter', 'ball', 'educational', 'learning', 'creative', 'art',
    'craft', 'coloring', 'playground', 'outdoor', 'indoor', 'fun', 'play'
  ],
  gaming: [
    'gaming', 'game', 'games', 'video game', 'console', 'playstation', 'xbox',
    'nintendo', 'pc gaming', 'computer game', 'mobile game', 'arcade',
    'controller', 'joystick', 'headset', 'keyboard', 'mouse', 'monitor',
    'streaming', 'esports', 'multiplayer', 'online', 'rpg', 'fps', 'mmorpg'
  ],
  organic: [
    'organic', 'natural', 'eco', 'green', 'sustainable', 'environmental',
    'fresh', 'healthy', 'pure', 'clean', 'non-toxic', 'chemical-free',
    'vegan', 'vegetarian', 'gluten-free', 'farm', 'local', 'artisan',
    'handmade', 'craft', 'premium', 'quality', 'wholesome', 'nutritious'
  ]
};

// Enhanced icon mapping with fuzzy matching and multiple keyword checks
export const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase().trim();
  
  // Direct exact matches first (most common cases)
  const directMatches = {
    'electronics': ElectronicsIcon,
    'food': FoodIcon,
    'fashion': FashionIcon,
    'health': HealthIcon,
    'beauty': HealthIcon,
    'home': HomeIcon,
    'sports': SportsIcon,
    'books': BooksIcon,
    'toys': ToysIcon,
    'gaming': GamingIcon,
    'organic': OrganicIcon,
    'fresh': OrganicIcon,
    'natural': OrganicIcon
  };
  
  if (directMatches[name]) {
    return directMatches[name];
  }
  
  // Check against comprehensive keyword lists
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const hasMatch = keywords.some(keyword => 
      name.includes(keyword) || keyword.includes(name)
    );
    
    if (hasMatch) {
      switch (category) {
        case 'electronics': return ElectronicsIcon;
        case 'food': return FoodIcon;
        case 'fashion': return FashionIcon;
        case 'health': return HealthIcon;
        case 'home': return HomeIcon;
        case 'sports': return SportsIcon;
        case 'books': return BooksIcon;
        case 'toys': return ToysIcon;
        case 'gaming': return GamingIcon;
        case 'organic': return OrganicIcon;
      }
    }
  }
  
  // Fallback: try partial word matching for compound words
  const words = name.split(/[\s-_]+/);
  for (const word of words) {
    if (word.length > 2) { // Only check meaningful words
      for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.includes(word)) {
          switch (category) {
            case 'electronics': return ElectronicsIcon;
            case 'food': return FoodIcon;
            case 'fashion': return FashionIcon;
            case 'health': return HealthIcon;
            case 'home': return HomeIcon;
            case 'sports': return SportsIcon;
            case 'books': return BooksIcon;
            case 'toys': return ToysIcon;
            case 'gaming': return GamingIcon;
            case 'organic': return OrganicIcon;
          }
        }
      }
    }
  }
  
  return DefaultIcon;
};

// Get category color based on name using comprehensive keyword matching
export const getCategoryColor = (categoryName: string): string => {
  const name = categoryName.toLowerCase().trim();
  
  // Direct exact matches first
  const directColorMatches = {
    'electronics': '#4CAF50',    // Primary green
    'food': '#66BB6A',           // Light green
    'fashion': '#2E7D32',        // Dark green
    'health': '#81C784',         // Light green variant
    'beauty': '#81C784',         // Light green variant
    'home': '#388E3C',           // Medium dark green
    'sports': '#4DB6AC',         // Blue-green
    'books': '#A5D6A7',          // Very light green
    'toys': '#8BC34A',           // Yellow-green
    'gaming': '#00695C',         // Dark teal
    'organic': '#26A69A',        // Teal
    'fresh': '#26A69A',          // Teal
    'natural': '#26A69A'         // Teal
  };
  
  if (directColorMatches[name]) {
    return directColorMatches[name];
  }
  
  // Check against comprehensive keyword lists (same as icon matching)
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const hasMatch = keywords.some(keyword => 
      name.includes(keyword) || keyword.includes(name)
    );
    
    if (hasMatch) {
      switch (category) {
        case 'electronics': return '#4CAF50';   // Primary green
        case 'food': return '#66BB6A';          // Light green
        case 'fashion': return '#2E7D32';       // Dark green
        case 'health': return '#81C784';        // Light green variant
        case 'home': return '#388E3C';          // Medium dark green
        case 'sports': return '#4DB6AC';        // Blue-green
        case 'books': return '#A5D6A7';         // Very light green
        case 'toys': return '#8BC34A';          // Yellow-green
        case 'gaming': return '#00695C';        // Dark teal
        case 'organic': return '#26A69A';       // Teal
      }
    }
  }
  
  // Fallback: try partial word matching
  const words = name.split(/[\s-_]+/);
  for (const word of words) {
    if (word.length > 2) {
      for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.includes(word)) {
          switch (category) {
            case 'electronics': return '#4CAF50';
            case 'food': return '#66BB6A';
            case 'fashion': return '#2E7D32';
            case 'health': return '#81C784';
            case 'home': return '#388E3C';
            case 'sports': return '#4DB6AC';
            case 'books': return '#A5D6A7';
            case 'toys': return '#8BC34A';
            case 'gaming': return '#00695C';
            case 'organic': return '#26A69A';
          }
        }
      }
    }
  }
  
  return '#4CAF50'; // Primary green for default
};
