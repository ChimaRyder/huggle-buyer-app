import React, { useState, useRef, useEffect } from 'react';
import { Alert, StyleSheet, View, ImageBackground, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, Text, Button, Icon, IconProps, IconElement } from '@ui-kitten/components';

const FacebookIcon = (props: IconProps) : IconElement => (
  <Icon {...props} name='facebook' pack='eva' />
);

const GoogleIcon = (props: IconProps) => (
  <Icon {...props} name='google' pack='eva' />
);

export default function WelcomeScreen() {
  const router = useRouter();

  const handleFacebookLogin = () => {
    router.push("/main/HomeScreen");
  };

  const handleGoogleLogin = () => {
    router.push("/main/HomeScreen");
  };

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
        <ImageBackground 
          source={require('../assets/images/welcome-screen-background.jpg')} 
          style={styles.backgroundImage}
        >
          <View style={styles.overlay} />
          <Layout style={styles.container}>
            <View style={styles.contentContainer}>
              <Text style={styles.headline}>Good Vibes. Great Finds.</Text>
              <Text style={styles.subtext}>Find the best deals for the best meals.</Text>
            
            <View style={styles.buttonContainer}>
              <Button
                style={styles.facebookButton}
                // accessoryLeft={FacebookIcon}
                onPress={handleFacebookLogin}
              >
                Continue with Facebook
              </Button>
              
              <Button
                style={styles.googleButton}
                status='basic'
                // accessoryLeft={GoogleIcon}
                onPress={handleGoogleLogin}
              >
                Continue with Google
              </Button>
            </View>

            <Text style={styles.termsText}>
              By signing up, you agree to our Terms and Conditions.
            </Text>
          </View>
        </Layout>
      </ImageBackground>
    </ApplicationProvider>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,29,36,0.6)',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 50,
  },
  headline: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'left',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 18,
    fontWeight: '200',
    color: 'white',
    textAlign: 'left',
    marginBottom: 70,
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 30,
  },
  facebookButton: {
    backgroundColor: '#3b5998',
    borderColor: '#3b5998',
  },
  googleButton: {
    backgroundColor: 'white',
    borderColor: '#051D24',
  },
  termsText: {
    fontSize: 14,
    fontWeight: '400',
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
  },
});