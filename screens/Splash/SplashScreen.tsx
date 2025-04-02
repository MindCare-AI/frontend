import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Auth' }], // Always go to Auth first
        })
      );
    }, 2000);

    return () => clearTimeout(timer);
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