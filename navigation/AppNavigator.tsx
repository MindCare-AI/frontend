import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FeedsScreen from '../screens/FeedsScreen/FeedsScreen';
import ChatbotScreen from '../screens/ChatbotScreen/ChatbotScreen';
import NotificationsScreen from '../screens/NotificationsScreen/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen/SettingsScreen';
import MessagingNavigator from './MessagingNavigator';

const Tab = createBottomTabNavigator();

// Custom header component with notifications badge
const NotificationBadge = ({ navigation }) => {
  return (
    <TouchableOpacity 
      style={styles.notificationBadge}
      onPress={() => navigation.navigate('Notifications')}
    >
      <Ionicons name="notifications-outline" size={24} color="#333" />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>3</Text>
      </View>
    </TouchableOpacity>
  );
};

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerRight: () => <NotificationBadge navigation={navigation} />,
        headerRightContainerStyle: { paddingRight: 15 },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              break;
            case 'Chatbot':
              iconName = 'chatbox-ellipses-outline';
              break;
            case 'MessagingTab':
              iconName = 'chatbubble-outline';
              break;
            case 'Profile':
              iconName = 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={FeedsScreen} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} />
      <Tab.Screen 
        name="MessagingTab" 
        component={MessagingNavigator}
        options={{ tabBarLabel: 'Messages' }}
      />
      <Tab.Screen name="Profile" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  notificationBadge: {
    position: 'relative',
    padding: 5,
  },
  badge: {
    position: 'absolute',
    right: -2,
    top: 0,
    backgroundColor: 'red',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default AppNavigator;
