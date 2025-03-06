import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { isOnboardingComplete } from '../../utils/onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    console.log("SplashScreen mounted");

    // Temporary: Force onboarding to be incomplete for testing
    AsyncStorage.setItem('onboarding_complete', 'false').then(() => {
      console.log('DEBUG - Forced onboarding status to false');
    });

    const checkOnboarding = async () => {
      try {
        const onboardingComplete = await isOnboardingComplete();
        console.log('DEBUG - Onboarding complete:', onboardingComplete);

        if (onboardingComplete) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'App' }],
            })
          );
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Auth' }], // Navigate to Auth if onboarding is not complete
            })
          );
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Fallback navigation if something goes wrong
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
          })
        );
      }
    };

    const timer = setTimeout(checkOnboarding, 2000); // 2 seconds delay
    return () => {
      console.log("SplashScreen unmounted");
      if (timer) clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/logo_mindcare.png')}
        style={{ width: 150, height: 150 }}
        resizeMode="contain"
      />
      <Text style={styles.appName}>MindCare AI</Text>
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
  appName: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#002D62',
  },
});

export default SplashScreen;