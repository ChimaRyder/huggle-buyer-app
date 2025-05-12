// MainTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import SearchScreen from './SearchScreen';
import FavoritesScreen from './FavoritesScreen';
import ProfileScreen from './ProfileScreen';
import Home from './Home';

const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused }) => {
        let iconName: keyof typeof MaterialIcons.glyphMap;
        switch (route.name) {
          case 'Home': iconName = 'home'; break;
          case 'Search': iconName = 'search'; break;
          case 'Favorites': iconName = 'favorite'; break;
          case 'Profile': iconName = 'person'; break;
          default: iconName = 'home';
        }
        return (
          <MaterialIcons
            name={iconName}
            size={28}
            color={focused ? '#548C2F' : '#F8F8F8'}
          />
        );
      },
      tabBarActiveTintColor: '#548C2F',
      tabBarInactiveTintColor: '#F8F8F8',
      tabBarStyle: {
        backgroundColor: '#051D24',
        height: 69,
        position: 'absolute',
        bottom: 0,
        borderTopWidth: 0,
        elevation: 0,
      },
      tabBarShowLabel: false,
    })}
  >
    <Tab.Screen name="Home" component={Home} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Favorites" component={FavoritesScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default MainTabs;
