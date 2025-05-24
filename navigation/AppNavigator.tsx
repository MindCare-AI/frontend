//navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { useWindowDimensions } from 'react-native';
import { Appbar } from 'react-native-paper';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// Existing imports
import MoodNavigator from './mood/MoodNavigator';
import { SettingsStack } from './SettingsStack';
import { globalStyles } from '../styles/global';
import ChatbotScreen from '../screens/ChatbotScreen/ChatbotScreen';
import DashboardScreen from '../screens/Appointments/DashboardScreen';
import JournalNavigator from './Journal';

// New imports
import ProfileScreen from '../screens/Appointments/therapist/ProfileScreen';
import SettingsScreen from '../screens/Appointments/therapist/SettingsScreen';
import AppointmentsScreen from '../screens/Appointments/therapist/AppointmentsScreen';
import DashboardScreenT from '../screens/Appointments/therapist/DashboardScreenT';
import ConversationsScreen from '../screens/Conversations/ConversationsScreen';
// Import ChatScreen
import ChatScreen from '../screens/Conversations/ChatScreen';
import MessagingNavigator from './MessagingNavigator';

// Import types or define them
import { AppStackParamList } from './types';
import FeedScreen from '../screens/FeedsScreen/FeedScreen';

// You'll need to update your types.ts file to include these
type DrawerParamList = {
  Home: undefined;
  Profile: undefined;
  TherapistSettings: undefined;
  Appointments: undefined;
};

type RootStackParamList = {
  Main: undefined;
  ChatScreen: { conversationId: string | number };
  ConversationDetails: { conversationId: string | number };
};

type MessagingStackParamList = {
  ConversationsList: undefined;
  ChatScreen: { conversationId: string | number };
};

const Tab = createBottomTabNavigator<AppStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();
const Stack = createStackNavigator<RootStackParamList>();
const MessagingStackNavigator = createStackNavigator<MessagingStackParamList>();

// Custom header for the stack navigator
const CustomNavigationBar = ({ navigation, back }: any) => {
  // Check if openDrawer is available
  const canOpenDrawer = navigation.openDrawer !== undefined;
  
  return (
    <Appbar.Header>
      {back ? (
        <Appbar.BackAction onPress={navigation.goBack} color="white" />
      ) : canOpenDrawer ? (
        <Appbar.Action
          icon="menu"
          color="white"
          onPress={() => navigation.openDrawer()}
        />
      ) : null}
      <Appbar.Content title="TherapistConnect" color="white" />
    </Appbar.Header>
  );
};

// Your existing Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'alert';

          switch (route.name) {
            case 'Feeds':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Chatbot':
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              break;
            case 'Notifications':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            case 'MoodTracker':
              return <Feather name="smile" size={size} color={color} />;
            case 'Journal':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'Messaging':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            default:
              iconName = 'alert';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: globalStyles.colors.primary,
        tabBarInactiveTintColor: globalStyles.colors.neutralMedium,
      })}
    >
      <Tab.Screen 
        name="Feeds" 
        component={FeedScreen} 
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Appointments" 
        component={DashboardScreenT}
        options={{ tabBarLabel: 'Appointments' }}
      />
      <Tab.Screen 
        name="Journal"
        component={JournalNavigator} 
        options={{ tabBarLabel: 'Journal' }}
      />
      <Tab.Screen 
        name="Chatbot" 
        component={ChatbotScreen} 
        options={{ tabBarLabel: 'Chatbot' }}
      />
      <Tab.Screen
        name="MoodTracker"
        component={MoodNavigator}
        options={{ 
          tabBarLabel: 'Mood',
          headerShown: false
        }}
      />
      <Tab.Screen
        name="Messaging"
        component={MessagingNavigator}
        options={{ 
          tabBarLabel: 'Messages',
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsStack} 
        options={{ 
          tabBarLabel: 'Settings',
          headerShown: false
        }}
      />
    </Tab.Navigator>
  );
};

// Drawer content
const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#003366',
        drawerInactiveTintColor: '#555',
        drawerStyle: {
          backgroundColor: '#fff',
          width: 240,
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={TabNavigator}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="calendar" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="TherapistSettings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="cog" size={24} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

// Main stack navigator
const AppNavigator = () => {
  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;

  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <CustomNavigationBar {...props} />,
      }}
    >
      <Stack.Screen
        name="Main"
        component={DrawerNavigator}
        options={{
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="ChatScreen" 
        component={ChatScreen}
        options={{
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="ConversationDetails" 
        component={ChatScreen} // Replace with actual ConversationDetails component
        options={{
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;