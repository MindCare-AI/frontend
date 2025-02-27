import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { checkOnboardingStatus } from '../navigation/AppNavigator';

type InitialLoadingScreenProps = {
  navigation: NavigationProp<any>;
};

const InitialLoadingScreen = ({ navigation }: InitialLoadingScreenProps) => {
  useEffect(() => {
    const checkNavigationFlow = async () => {
      try {
        // Check if user has completed onboarding
        const onboardingComplete = await checkOnboardingStatus();
        
        // Small delay to avoid flickering
        setTimeout(() => {
          if (onboardingComplete) {
            // User has already seen onboarding
            navigation.navigate('Splash');
          } else {
            // First time user, show onboarding
            navigation.navigate('Onboarding');
          }
        }, 1000);
      } catch (error) {
        console.error(error);
        // Default to splash if there's an error
        navigation.navigate('Splash');
      }
    };

    checkNavigationFlow();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#002D62" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E4F0F6',
  },
});

export default InitialLoadingScreen;