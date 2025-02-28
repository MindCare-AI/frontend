import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { isOnboardingComplete } from '../../utils/onboarding';
import Logo from '../../assets/images/logo_mindcare.svg';
import { useNavigation, CommonActions } from '@react-navigation/native';

type SplashScreenProps = {
  navigation: StackNavigationProp<any>;
};

const SplashScreen = () => {
  const navigation = useNavigation();
  
  useEffect(() => {
    console.log("SplashScreen mounted");
    const checkOnboarding = async () => {
      // Add a timeout to show splash for at least 2 seconds
      const timer = setTimeout(async () => {
        const onboardingComplete = await isOnboardingComplete();
        console.log('Onboarding complete:', onboardingComplete); // Debug log
        
        if (onboardingComplete) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'App', params: { screen: 'Welcome' } }],
            })
          );
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Onboarding' }],
            })
          );
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    };

    checkOnboarding();
    
    return () => {
      console.log("SplashScreen unmounted");
      // clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Logo width={150} height={150} />
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
  }
});

export default SplashScreen;
