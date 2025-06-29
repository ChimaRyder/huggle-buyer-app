import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Image } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import PageTitle from '../../components/PageTitle';

const SettingsScreen = () => {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('USD - US Dollar');
  const [location, setLocation] = useState('Singapore');
  
  const toggleSwitch = () => setNotificationsEnabled(previousState => !previousState);
  const toggleDarkMode = () => setDarkMode(previousState => !previousState);

  const settingsItems = [
    {
      title: 'Edit Profile',
      icon: <MaterialIcons name="person-outline" size={24} color="#104911" />,
      onPress: () => router.push('../(screens)/EditProfile'),
    },
    {
      title: 'Push Notifications',
      icon: <MaterialIcons name="notifications-none" size={24} color="#104911" />,
      rightComponent: (
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={notificationsEnabled ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={notificationsEnabled}
        />
      ),
    },
    {
      title: 'Dark Mode',
      icon: <MaterialCommunityIcons name="theme-light-dark" size={24} color="#104911" />,
      rightComponent: (
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={darkMode ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleDarkMode}
          value={darkMode}
        />
      ),
    },
    {
      title: 'Language',
      icon: <Ionicons name="language-outline" size={24} color="#104911" />,
      rightText: language,
      onPress: () => {},
    },
    {
      title: 'Currency',
      icon: <FontAwesome5 name="money-bill-wave" size={20} color="#104911" />,
      rightText: currency,
      onPress: () => {},
    },
    {
      title: 'Location',
      icon: <Ionicons name="location-outline" size={24} color="#104911" />,
      rightText: location,
      onPress: () => {},
    },
    {
      title: 'Help Center',
      icon: <Feather name="help-circle" size={24} color="#104911" />,
      onPress: () => {},
    },
    {
      title: 'Invite Friends',
      icon: <Ionicons name="person-add-outline" size={24} color="#104911" />,
      onPress: () => {},
    },
    {
      title: 'Logout',
      icon: <MaterialIcons name="logout" size={24} color="#AA2A2A" />,
      textColor: '#AA2A2A',
      onPress: () => {},
    },
  ];

  return (
    <View style={styles.container}>
      <PageTitle title="Settings" showBackButton={true} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageBorder}>
              <Image 
                source={{ uri: 'https://via.placeholder.com/100' }} 
                style={styles.profileImage} 
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Karen Carpenter</Text>
              <Text style={styles.profileEmail}>karencarpenter@example.com</Text>
            </View>
          </View>
        </View>

        <View style={styles.settingsContainer}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.settingItem}
              onPress={item.onPress}
              disabled={!item.onPress}
            >
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  {item.icon}
                </View>
                <Text style={[styles.settingText, item.textColor && { color: item.textColor }]}>
                  {item.title}
                </Text>
              </View>
              <View style={styles.settingRight}>
                {item.rightComponent || (
                  <>
                    <Text style={[styles.settingRightText, item.textColor && { color: item.textColor }]}>
                      {item.rightText}
                    </Text>
                    <MaterialIcons name="chevron-right" size={24} color={item.textColor || '#999'} />
                  </>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  profileImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageBorder: {
    borderWidth: 3,
    borderColor: '#F9A620',
    borderRadius: 50,
    padding: 5,
    marginRight: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  settingsContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#f5f5f5',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: 15,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingRightText: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
});

export default SettingsScreen;