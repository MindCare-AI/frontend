//navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { useWindowDimensions, View, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useAuth } from '../contexts/AuthContext';

// Existing imports
import MoodNavigator from './mood/MoodNavigator';
import { SettingsStack } from './SettingsStack';
import { globalStyles } from '../styles/global';
import ChatbotNavigator from './ChatbotNavigator';
import ChatbotScreen from '../screens/ChatbotScreen/ChatbotScreen';
import DashboardScreen from '../screens/Appointments/patient/DashboardScreen';
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
import CreatePostScreen from '../screens/CreatePostScreen/CreatePostScreen';

// Import types or define them
import { AppStackParamList } from './types';
import FeedScreen from '../screens/FeedsScreen/FeedScreen';

// Stack navigator types
type FeedsStackParamList = {
  FeedsList: undefined;
  CreatePost: undefined;
};

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
  FeedsList: undefined;
  CreatePost: undefined;
};

type MessagingStackParamList = {
  ConversationsList: undefined;
  ChatScreen: { conversationId: string | number };
};

const Tab = createBottomTabNavigator<AppStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();
const Stack = createStackNavigator<RootStackParamList>();
const MessagingStackNavigator = createStackNavigator<MessagingStackParamList>();
const FeedsStack = createStackNavigator<FeedsStackParamList>();


// Your existing Tab Navigator
const TabNavigator = () => {
  const { user } = useAuth();
  const userType = user?.user_type || 'patient'; // Default to patient if not set

  // Define tab screens based on user type
  const tabScreens = [
    // Common tabs for all users
    {
      name: "Feeds",
      component: FeedsStackNavigator,
      options: { 
        tabBarLabel: 'Home',
        headerShown: false,
        tabBarIcon: ({ focused, color, size }: { focused: boolean, color: string, size: number }) => (
          <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
        ),
      }
    },
    {
      name: "Appointments",
      component: userType === 'therapist' ? DashboardScreenT : DashboardScreen,
      options: { 
        tabBarLabel: 'Appointments',
        tabBarIcon: ({ focused, color, size }: { focused: boolean, color: string, size: number }) => (
          <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
        ),
      }
    },
    // Conditional tabs for patients only
    ...(userType !== 'therapist' ? [
      {
        name: "Journal",
        component: JournalNavigator,
        options: { 
          tabBarLabel: 'Journal',
          tabBarIcon: ({ focused, color, size }: { focused: boolean, color: string, size: number }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={size} color={color} />
          ),
        }
      },
      {
        name: "MoodTracker",
        component: MoodNavigator,
        options: { 
          tabBarLabel: 'Mood',
          headerShown: false,
          tabBarIcon: ({ focused, color, size }: { focused: boolean, color: string, size: number }) => (
            <Feather name="smile" size={size} color={color} />
          ),
        }
      },
    ] : []),
    // Chatbot tab with floating hexagon button
    {
      name: "Chatbot",
      component: ChatbotNavigator,
      options: { 
        tabBarLabel: '',
        headerShown: false,
        tabBarIcon: ({ focused, color }: { focused: boolean, color: string, size: number }) => (
          <View style={styles.hexagonContainer}>
            <View style={styles.hexagon}>
              <FontAwesome5 
                name="brain" 
                size={28} 
                color="#FFFFFF" 
              />
            </View>
          </View>
        ),
      }
    },
    // Common tabs for all users (continued)
    {
      name: "Messaging",
      component: MessagingNavigator,
      options: { 
        tabBarLabel: 'Messages',
        headerShown: false,
        tabBarIcon: ({ focused, color, size }: { focused: boolean, color: string, size: number }) => (
          <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={size} color={color} />
        ),
      }
    },
    {
      name: "Settings",
      component: SettingsStack,
      options: { 
        tabBarLabel: 'Settings',
        headerShown: false,
        tabBarIcon: ({ focused, color, size }: { focused: boolean, color: string, size: number }) => (
          <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
        ),
      }
    },
  ];

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: globalStyles.colors.primary,
        tabBarInactiveTintColor: globalStyles.colors.neutralMedium,
        tabBarStyle: {
          height: 60,
          position: 'relative',
          paddingBottom: 5,
        },
      }}
    >
      {tabScreens.map((screen) => (
        <Tab.Screen
          key={screen.name}
          name={screen.name as keyof AppStackParamList}
          component={screen.component}
          options={screen.options}
        />
      ))}
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

// Create a stack navigator for the feeds to include CreatePost
function FeedsStackNavigator() {
  return (
    <FeedsStack.Navigator screenOptions={{ headerShown: false }}>
      <FeedsStack.Screen name="FeedsList" component={FeedScreen} />
      <FeedsStack.Screen 
        name="CreatePost" 
        component={CreatePostScreen}
        options={{
          headerShown: true,
          headerTitle: 'Create Post'
        }}
      />
    </FeedsStack.Navigator>
  );
}

// Main stack navigator
const AppNavigator = () => {
  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={DrawerNavigator}
        options={{
          headerShown: false,
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

const styles = StyleSheet.create({
  hexagonContainer: {
    alignItems: 'center',
    width: 80,
    height: 80,
    marginBottom: 30, // Lift it above the tab bar
  },
  hexagon: {
    width: 60,
    height: 60,
    backgroundColor: globalStyles.colors.primary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    transform: [{ translateY: -15 }], // Move up to float above tab bar
    // For hexagon effect (simplified with border radius)
    position: 'absolute',
    bottom: 0,
  },
});

export default AppNavigator;