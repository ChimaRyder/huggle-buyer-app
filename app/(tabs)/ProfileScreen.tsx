import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { profileStyles } from '../../components/profileStyles';
import { useRouter } from 'expo-router';
import { useClerk } from '@clerk/clerk-expo';

const ProfileScreen = () => {
  const router = useRouter();
  const { signOut } = useClerk();
  const userName = 'Karen Carpenter';
  const profileImage = '';

  // Define the label-route mapping
  const tabs = [
    { label: 'Orders', route: '../(screens)/Orders' as const },
    //{ label: 'Chats', route: '/(tabs)/chats' },
    { label: 'Settings', route: '../(screens)/settings' as const }, 
    { label: 'Know secret discounts?', route: '../(screens)/secrets' as const },
  ];

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
        {tabs.map(({ label, route }) => (
          <TouchableOpacity key={label} onPress={() => router.push(route)}>
            <BlurView intensity={50} tint="light" style={profileStyles.glassTab}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                <Text style={profileStyles.tabText}>{label}</Text>
                <MaterialIcons name="chevron-right" size={24} color="#104911" />
              </View>
            </BlurView>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={() => {
        Alert.alert(
          'Log Out',
          'Are you sure you want to log out?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Log Out',
              style: 'destructive',
              onPress: () => {
                signOut();
                router.replace("../(login)");
              },
            },
          ],
          { cancelable: true }
        );
      }}>
        <BlurView intensity={40} tint="light" style={profileStyles.signOutButton}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <Text style={profileStyles.signOutText}>Sign out</Text>
            <MaterialIcons name="chevron-right" size={24} color="#AA2A2A" />
          </View>
        </BlurView>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ProfileScreen;
