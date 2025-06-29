import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface PageTitleProps {
  title: string;
  showBackButton?: boolean;
}

const PageTitle = ({ title, showBackButton = true }: PageTitleProps) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {showBackButton && (
        <TouchableOpacity onPress={() => router.back()} style={styles.iconWrapper}>
          <Ionicons name="arrow-back" size={24} color="#051D24" />
        </TouchableOpacity>
      )}
      <View style={[
        styles.titleWrapper,
        !showBackButton && { marginLeft: 48 } // Add left margin when there's no back button
      ]}>
        <Text category="h5" style={styles.title}>{title}</Text>
      </View>
    </View>
  );
};

export default PageTitle;

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    borderColor: 'rgba(197, 197, 197, 0.94)',
    borderWidth: 0.5,
    borderBottomRightRadius: 20,
    borderTopRightRadius: 20,
    padding: 12,
    margin: 16,
    left: -20,
    alignSelf: 'flex-start', // This ensures the container wraps its content
    backdropFilter: 'blur(10px)', // works on web; fallback for mobile is semi-transparent bg
  },
  iconWrapper: {
    marginRight: 12,
    marginLeft: 12,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    color: '#051D24',
    fontWeight: 'bold',
  },
});
