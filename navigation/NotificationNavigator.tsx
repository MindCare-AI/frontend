import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { NotificationsScreen } from '../screens/notificationsScreen/NotificationsScreen';
import NotificationDetailScreen from '../screens/notificationsScreen/NotificationDetailScreen'; // Create a placeholder if needed

const NotificationStack = createStackNavigator<RootStackParamList>();

const NotificationNavigator: React.FC = () => {
  return (
    <NotificationStack.Navigator screenOptions={{ headerShown: false }}>
      <NotificationStack.Screen name="Notifications" component={NotificationsScreen} />
      <NotificationStack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
    </NotificationStack.Navigator>
  );
};

export default NotificationNavigator;