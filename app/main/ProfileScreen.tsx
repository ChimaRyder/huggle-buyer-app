import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@ui-kitten/components';

const ProfileScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.placeholder}><Text category="h4">Profile Screen</Text></View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  placeholder: { marginTop: 100, alignItems: 'center' },
});

export default ProfileScreen;
