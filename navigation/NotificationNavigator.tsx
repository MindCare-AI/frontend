import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import {
  NotificationsScreen,
} from '../screens/notificationsScreen/NotificationsScreen';
import NotificationDetailScreen from '../screens/notificationsScreen/NotificationDetailScreen';
import { globalStyles } from '../styles/global';

const NotificationStack = createStackNavigator<RootStackParamList>();

const NotificationNavigator: React.FC = () => {
  return (
    <NotificationStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: globalStyles.colors.primary,
          shadowColor: globalStyles.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 2,
        },
        headerTintColor: globalStyles.colors.white,
        headerTitleStyle: {
          ...globalStyles.subtitle,
          color: globalStyles.colors.white,
        },
      }}
    >
      <NotificationStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <NotificationStack.Screen name="NotificationDetail" component={NotificationDetailScreen} options={{ title: 'Notification Detail' }} />
    </NotificationStack.Navigator>
  );
};

export default NotificationNavigator;