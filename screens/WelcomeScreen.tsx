import React from 'react';
import { View, Text } from 'react-native';
import Button from '../components/Button';
import { globalStyles } from '../styles/global';
import { NavigationProp } from '@react-navigation/native';

type WelcomeScreenProps = {
  navigation: NavigationProp<any>;
};

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  return (
    <View style={globalStyles.container}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Welcome to MindCare_AI</Text>
      <Button title="Login" onPress={() => navigation.navigate('Login')} />
      <Button title="Signup" onPress={() => navigation.navigate('Signup')} />
    </View>
  );
}