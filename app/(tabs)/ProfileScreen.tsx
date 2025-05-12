import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { profileStyles } from '../../components/profileStyles';

const ProfileScreen = () => {
  const userName = 'Karen Carpenter';
  const profileImage = ''; // Empty string if user has not uploaded a photo

  return (
    <SafeAreaView style={profileStyles.container}>
      <View style={profileStyles.imageWrapper}>
        <View style={profileStyles.imageBorder}>
          <BlurView intensity={20} tint="light" style={profileStyles.blurContainer} />
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={profileStyles.profileImage} />
          ) : (
            <MaterialIcons name="person" size={80} color="#999" />
          )}
        </View>
        <Text style={profileStyles.userName}>{userName}</Text>
      </View>

      <View style={profileStyles.tabsWrapper}>
        {['Orders', 'Chats', 'Settings', 'Know secret discounts?'].map((label) => (
          <BlurView intensity={50} tint="light" style={profileStyles.glassTab} key={label}>
            <Text style={profileStyles.tabText}>{label}</Text>
            <MaterialIcons name="chevron-right" size={24} color="#104911" />
          </BlurView>
        ))}
      </View>

      <BlurView intensity={40} tint="light" style={profileStyles.signOutButton}>
        <Text style={profileStyles.signOutText}>Sign out</Text>
        <MaterialIcons name="chevron-right" size={24} color="#AA2A2A" />
      </BlurView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    alignItems: 'center',
  },
  imageWrapper: {
    alignItems: 'center',
    marginTop: 105,
  },
  imageBorder: {
    borderWidth: 7,
    borderColor: '#F9A620',
    borderRadius: 100,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 130,
    height: 130,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9A620',
  },
  tabsWrapper: {
    marginTop: 40,
    width: width * 0.85,
  },
  glassTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#104911',
    textAlign: 'left',
  },
  signOutButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 40,
    marginBottom: 40,
    width: width * 0.85,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#AA2A2A',
  },
});


