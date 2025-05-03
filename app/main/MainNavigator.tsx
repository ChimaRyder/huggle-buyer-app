import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '@ui-kitten/components';
import HomeScreen from './HomeScreen';
import SearchScreen from './SearchScreen';
import FavoritesScreen from './FavoritesScreen';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

const MainNavigator = () => (


  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        let iconName = '';
        switch (route.name) {
          case 'Home':
            iconName = 'home-outline';
            break;
          case 'Search':
            iconName = 'search-outline';
            break;
          case 'Favorites':
            iconName = 'heart-outline';
            break;
          case 'Profile':
            iconName = 'person-outline';
            break;
        }
        return <Icon name={iconName} fill={color} style={{ width: size, height: size }} />;
      },
      tabBarActiveTintColor: '#3C6E47',
      tabBarInactiveTintColor: '#BFC9BE',
      tabBarStyle: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, height: 64 },
      tabBarLabelStyle: { fontSize: 12, marginBottom: 4 },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Favorites" component={FavoritesScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default MainNavigator;
