//navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import FeedsScreen from '../screens/FeedsScreen/FeedsScreen';
import ChatbotScreen from '../screens/ChatbotScreen/ChatbotScreen';
import MessagingNavigator from './MessagingNavigator';
import AppointmentManagementScreen from '../screens/AppointmentManagementScreen/AppointmentManagementScreen';
import BookAppointmentScreen from '../screens/AppointmentManagementScreen/BookAppointment';
import { RootStackParamList } from '../types/navigation';
import { SettingsHomeScreen } from '../screens/SettingsScreen/SettingsHomeScreen';
import { UserPreferencesScreen } from '../screens/SettingsScreen/UserPreferencesScreen';
import { UserSettingsScreen } from '../screens/SettingsScreen/UserSettingsScreen';
import { UserProfileScreen } from '../screens/SettingsScreen/UserProfileScreen';

const Tab = createBottomTabNavigator<RootStackParamList>();
const SettingsStack = createStackNavigator();
const AppointmentStack = createStackNavigator<RootStackParamList>();

interface NotificationBadgeProps {
  navigation: NavigationProp<RootStackParamList>;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ navigation }) => {
  return (
    <TouchableOpacity
      style={styles.notificationBadge}
      onPress={() => navigation.navigate('Notifications')}
    >
      <Ionicons name="notifications-outline" size={24} color="#333" />
    </TouchableOpacity>
  );
};

const SettingsStackNavigator = () => {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsHome" component={SettingsHomeScreen} />
      <SettingsStack.Screen 
        name="UserPreferences" 
        component={UserPreferencesScreen} 
        options={{ title: 'Preferences' }} 
      />
      <SettingsStack.Screen 
        name="UserSettings" 
        component={UserSettingsScreen} 
        options={{ title: 'Account Settings' }} 
      />
      <SettingsStack.Screen 
        name="UserProfile" 
        component={UserProfileScreen} 
        options={{ title: 'Profile' }} 
      />
    </SettingsStack.Navigator>
  );
};

const AppointmentStackNavigator = () => {
  return (
    <AppointmentStack.Navigator>
      <AppointmentStack.Screen 
        name="AppointmentManagement" 
        component={AppointmentManagementScreen}
        options={{ 
          title: 'Appointments',
          headerShown: true
        }}
      />
      <AppointmentStack.Screen 
        name="BookAppointment" 
        component={BookAppointmentScreen}
        options={{ 
          title: 'Book Appointment',
          headerShown: true
        }}
      />
    </AppointmentStack.Navigator>
  );
};

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerRight: () => <NotificationBadge navigation={navigation} />,
        headerRightContainerStyle: { paddingRight: 15 },
        tabBarIcon: ({ color, size }) => {
          let iconName: IconName;
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
            case 'Settings':
              iconName = 'person-outline';
              break;
            case 'Appointments':
              iconName = 'calendar-outline';
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
      <Tab.Screen 
        name="Settings" 
        component={SettingsStackNavigator} 
        options={{ tabBarLabel: 'Settings' }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            // If the nested stack has routes beyond the initial one, navigate back to the initial screen.
            if (route.state && route.state.index > 0) {
              navigation.navigate('Settings', { screen: 'SettingsHome' });
            }
          },
        })}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentStackNavigator}
        options={{ tabBarLabel: 'Appointments' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  notificationBadge: {
    padding: 8,
  },
});

export default AppNavigator;