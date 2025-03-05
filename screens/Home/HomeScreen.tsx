//screens/Home/HomeScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import NavigationArea from '../../components/NavigationArea'; 

type HomeScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [currentScreen, setCurrentScreen] = useState('Feeds');
  
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

  // Helper function to render different content based on selected navigation
  const renderContent = () => {
    switch (currentScreen) {
      case 'Feeds':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Your Feed</Text>
            <Text style={styles.contentText}>Latest updates and articles will appear here.</Text>
          </View>
        );
      case 'Chatbot':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>MindCare AI Assistant</Text>
            <Text style={styles.contentText}>Chat with our AI assistant for mental health support.</Text>
          </View>
        );
      case 'Notifications':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Notifications</Text>
            <Text style={styles.contentText}>You have no new notifications.</Text>
          </View>
        );
      case 'Settings':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Settings</Text>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.buttonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  // Handle navigation directly in the HomeScreen
  const handleScreenChange = (screenName: string) => {
    setCurrentScreen(screenName);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>MindCare AI</Text>
        </View>
        
        {renderContent()}
        
        <View style={styles.navigationContainer}>
          <NavigationArea 
            currentScreen={currentScreen}
            onScreenChange={handleScreenChange}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E4F0F6',
  },
  container: {
    flex: 1,
    backgroundColor: '#E4F0F6',
  },
  header: {
    padding: 16,
    backgroundColor: '#002D62',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#002D62',
    marginBottom: 16,
  },
  contentText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#002D62',
    padding: 15,
    borderRadius: 10,
    width: '60%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  navigationContainer: {
    width: '100%',
  },
});

export default HomeScreen;