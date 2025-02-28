//screens/Home/HomeScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HomeScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const handleLogout = async () => {
    try {
      // Clear both tokens
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
      
      // Navigate to Auth stack
      navigation.reset({
        index: 0,
        routes: [{ 
          name: 'Auth' as never,
          params: { screen: 'Login' } 
        }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to MindCare AI</Text>
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#002D62',
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#002D62',
    padding: 15,
    borderRadius: 10,
    width: '60%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HomeScreen;