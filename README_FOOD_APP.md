# Food E-commerce App (Pickup Orders)

This is a prototype of a food e-commerce application for pickup orders, built on top of the existing Huggle buyer app.

## Features

### Main Screens
1. **Home Screen** - Browse food categories and popular restaurants
2. **Search Screen** - Search for restaurants or food items
3. **Favorites Screen** - View favorite restaurants
4. **Profile Screen** - User profile and settings
5. **Notifications Screen** - Order and promotional notifications

### Food-Specific Screens
1. **Restaurant Detail Screen** - View restaurant menu and place orders
2. **Cart Screen** - Manage food items and checkout
3. **Category Screen** - Browse restaurants by food category
4. **Order Confirmation Screen** - View order confirmation details

## Architecture

### Data Models
- `FoodCategory` - Food categories (Burgers, Pizza, etc.)
- `Restaurant` - Restaurant information
- `FoodItem` - Individual food items
- `CartItem` - Items in the shopping cart
- `Order` - Order information

### Components
- `RestaurantCard` - Display restaurant information
- `FoodItemCard` - Display food item information
- `CartItemCard` - Display cart items with quantity controls

### Context
- `CartContext` - Manage shopping cart state across the app

## Implementation Notes

This is a frontend-only prototype with mock data. Backend integration would require:
1. REST API endpoints for restaurants, food items, and orders
2. User authentication and profile management
3. Payment processing integration
4. Real-time order status updates

## Directory Structure
```
/components
  /food          - Food-specific UI components
  /restaurant    - Restaurant-specific UI components
  /cart          - Cart-related UI components
/context         - React context providers
/data
  /food          - Food data models and mock data
/screens
  /food          - Food-specific screens
```

## Getting Started

1. Install dependencies: `npm install`
2. Start the app: `npm start`
3. Choose your platform (iOS, Android, or Web)

## Future Enhancements

1. Backend integration for real data
2. User order history
3. Restaurant ratings and reviews
4. Advanced search and filtering
5. Promotion and discount codes
6. Multiple payment methods
7. Real-time order tracking