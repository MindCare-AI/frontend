//screens/InitialLoadingScreen.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { isOnboardingComplete } from '../utils/onboarding';

type Props = {
  navigation: NavigationProp<any>;
};

const InitialLoadingScreen = ({ navigation }: Props) => {
  useEffect(() => {
    const checkNavigationFlow = async () => {
      const onboardingComplete = await isOnboardingComplete();
      setTimeout(() => {
        navigation.navigate(onboardingComplete ? 'Splash' : 'Onboarding');
      }, 1000);
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
