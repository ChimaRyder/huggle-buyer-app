import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const PageTitle = ({ title }: { title: string }) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.iconWrapper}>
        <Ionicons name="arrow-back" size={24} color="#051D24" />
      </TouchableOpacity>
      <View style={styles.titleWrapper}>
        <Text category="h5" style={styles.title}>{title}</Text>
      </View>
    </View>
  );
};

export default PageTitle;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
    margin: 16,
    backdropFilter: 'blur(10px)', // works on web; fallback for mobile is semi-transparent bg
  },
  iconWrapper: {
    marginRight: 12,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    color: '#051D24',
    fontWeight: 'bold',
  },
});
