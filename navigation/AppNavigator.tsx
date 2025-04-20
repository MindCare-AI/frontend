//navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import FeedsScreen from '../screens/FeedsScreen/FeedsScreen';
import ChatbotScreen from '../screens/ChatbotScreen/ChatbotScreen';
import MessagingNavigator from './MessagingNavigator';
import AppointmentManagementScreen from '../screens/AppointmentManagementScreen/AppointmentManagementScreen';
import BookAppointmentScreen from '../screens/AppointmentManagementScreen/BookAppointment';
import { SettingsHomeScreen } from '../screens/SettingsScreen/SettingsHomeScreen';
import { UserPreferencesScreen } from '../screens/SettingsScreen/UserPreferencesScreen';
import { UserSettingsScreen } from '../screens/SettingsScreen/UserSettingsScreen';
import { UserProfileScreen } from '../screens/SettingsScreen/UserProfileScreen';
import { RootStackParamList, SettingsStackParamList, AppointmentStackParamList } from '../types/navigation';
import { globalStyles } from '../styles/global';

const Tab = createBottomTabNavigator<RootStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();
const AppointmentStack = createStackNavigator<AppointmentStackParamList>();

interface NotificationBadgeProps {
  navigation: NavigationProp<RootStackParamList>;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ navigation }) => {
  return (
      <TouchableOpacity
        style={{ padding: globalStyles.spacing.sm }}
        onPress={() => navigation.navigate('Notifications')}>
        <Ionicons name="notifications-outline" size={24} color={globalStyles.colors.textPrimary} />
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
        listeners={({ navigation }) => ({
          tabPress: () => {
            // Simply navigate to Settings since it's defined as undefined in RootStackParamList
            navigation.navigate('Settings');
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

export default AppNavigator;